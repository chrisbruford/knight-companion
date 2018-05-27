import { Injectable, NgZone } from '@angular/core';
import { RE } from '../core/services/re.service';
import * as fs from "fs";
import * as stream from "stream";
import * as os from "os";
import * as util from "util";
import { Observable, Subject, BehaviorSubject, Subscription, Observer, combineLatest } from 'rxjs';
import { first, take } from 'rxjs/operators';
let ndjson = require('ndjson');
import * as journal from 'cmdr-journal';
const { dialog, app } = require('electron').remote;
import { JournalDBService } from './db/journal-db.service';
import { LoggerService } from '../core/services/logger.service';
import { JournalQueueService } from './journalQueue.service';
import { EventEmitter } from 'events';
import { setInterval, clearInterval } from 'timers';
import { FileHeader, FSDJump } from 'cmdr-journal';
import { EDDNService } from './eddn.service';

@Injectable()
export class JournalService extends EventEmitter {

    private offset = 0;
    private currentLogFile: string;
    private firstStream = true;
    private _streamLive = false;

    private _logDir: string;
    private _beta: boolean;
    private _currentSystem = new BehaviorSubject("Unknown");
    private _currentSystemAddress = new BehaviorSubject(NaN);
    private _currentSystemStarPos = new BehaviorSubject<[number, number, number]>([NaN, NaN, NaN]);
    private _cmdrName = new BehaviorSubject("Unknown CMDR");
    private _currentShipID = new BehaviorSubject(NaN);

    constructor(
        private re: RE,
        private ngZone: NgZone,
        private journalDB: JournalDBService,
        private logger: LoggerService,
        private journalQueue: JournalQueueService,
        private eddn: EDDNService
    ) {
        super();

        //get current state values and set intial values of BehaviourSubjects
        this.journalDB.getEntry<{ key: string, value: string }>("currentState", "currentSystem")
            .then(currentSystem => {
                if (currentSystem && currentSystem.value && typeof currentSystem.value === "string") {
                    this._currentSystem.next(currentSystem.value);
                }
            }).catch(err => {
                this.logger.error({
                    originalError: err,
                    message: "currentState.currentSystem initial setup failure"
                })
            });

        this.journalDB.getEntry<{ key: string, value: number }>("currentState", "currentSystemAddress")
            .then(currentSystemAddress => {
                if (currentSystemAddress && currentSystemAddress.value && typeof currentSystemAddress.value === "number") {
                    this._currentSystemAddress.next(currentSystemAddress.value);
                }
            }).catch(err => {
                this.logger.error({
                    originalError: err,
                    message: "currentState.currentSystemAddress initial setup failure"
                })
            });

        this.journalDB.getEntry<{ key: string, value: [number, number, number] }>("currentState", "currentSystemStarPos")
            .then(currentSystemStarPos => {
                if (currentSystemStarPos && currentSystemStarPos.value && currentSystemStarPos instanceof Array) {
                    this._currentSystemStarPos.next(currentSystemStarPos.value);
                }
            }).catch(err => {
                this.logger.error({
                    originalError: err,
                    message: "currentState.currentSystemStarPos initial setup failure"
                })
            });

        this.journalDB.getEntry<{ key: string, value: string }>("currentState", "cmdrName")
            .then(cmdrName => {
                if (cmdrName && cmdrName.value && typeof cmdrName.value === "string") {
                    this._cmdrName.next(cmdrName.value);
                }
            }).catch(err => {
                this.logger.error({
                    originalError: err,
                    message: "currentState.cmdrName initial setup failure"
                })
            });

        localStorage.logDir = this._logDir = localStorage.logDir || this.detectDir() || this.selectDirDialog();
        this.streamAll(this._logDir);
    }

    get logDirectory() {
        return this._logDir;
    }

    get currentSystem(): Observable<string> {
        return this._currentSystem.asObservable();
    }

    get currentSystemAddress(): Observable<number> {
        return this._currentSystemAddress.asObservable();
    }

    get currentSystemStarPos(): Observable<[number, number, number]> {
        return this._currentSystemStarPos.asObservable();
    }

    get cmdrName(): Observable<string> {
        return this._cmdrName.asObservable();
    }

    get shipID(): Observable<number> {
        return this._currentShipID.asObservable();
    }

    get beta(): boolean {
        return this._beta;
    }

    get isStreaming(): boolean {
        return this._streamLive;
    }

    private streamAll(dir: string) {
        if (!dir) { return }
        //reads all journal files and persists the data to IDB, keeps record
        //of files it's seen already so doesn't re-stream them
        fs.readdir(dir, (err, files) => {
            if (!files) { return }
            let journalFilePaths = files.filter((path: string): boolean => {
                return this.re.logfile.test(path)
            }).sort();
            if (journalFilePaths.length === 0) { return }

            //stream all but the last file as last file will be tailstreamed
            this._streamLive = true;
            //TODO: Don't think this needs to be assigned or async - can make whole StreamAll
            //function async instead
            let historicLogs = (async () => {
                for (let i = 0; i < journalFilePaths.length - 1; i++) {
                    let path = journalFilePaths[i];
                    await this.journalDB.getEntry('completedJournalFiles', path)
                        .then(data => {
                            if (!data) {
                                this.journalQueue.addPath(`${dir}/${path}`)
                                    .on('data', (data: journal.JournalEvent) => this.handleEvent(data))
                                    .on('end', () => this.journalDB.addEntry('completedJournalFiles', { filename: path }))
                            }
                        })
                        .catch(err => {
                            this.logger.error(err);
                        })
                }
            })()
                .then(() => {
                    //tailstream last file
                    this.currentLogFile = journalFilePaths.slice(-1)[0];
                    this.tailStream(`${dir}/${this.currentLogFile}`, { start: this.offset, encoding: 'utf8' });
                })
        });
    }

    //streams entire file, tracking offset from start, then 
    //watches for changes and re-streams from the saved offset, updating
    //offset and re-watching.
    private tailStream(path: string, options: { start: number, encoding: string }) {
        //avoid situation where logfile changes before async operations complete
        this.journalDB.getEntry('completedJournalFiles', this.currentLogFile).then(data => {
            if (!data) { this.journalDB.addEntry('completedJournalFiles', { filename: this.currentLogFile }) }
        });

        let stream = fs.createReadStream(path, options).pause()
            .on('data', (data: string) => {
                this.offset += data.length;
            })
        let newStream = this.journalQueue.addStream(stream);
        newStream.on('data', (data: journal.JournalEvent) => {
            newStream.pause();
            this.handleEvent(data).then(() => {
                //emit events as they're occuring in-session here
                if (!this.firstStream) {
                    this.ngZone.run(() => this.emit(data.event, data));
                }
                newStream.resume();
            })
                .catch((reason: string) => {
                    this.logger.error({ originalError: reason, message: "handleEvent rejected in tailStream" })
                    newStream.resume();
                })
        })

            .on('error', (originalError: any) => this.logger.error({originalError, message: "tailstream error"}))

            .on('end', () => this.watchLogDir())

        return stream;
    }

    public watchLogDir(): void {
        //once here first stream must be done so
        //we can be sure all future events are 'live'
        //so can be emitted out
        this.firstStream = false;

        //test if this file is Beta
        this._beta = /beta/i.test(this.currentLogFile);

        new Promise((resolve, reject) => {
            fs.open(`${this._logDir}/${this.currentLogFile}`, 'r', (err, fd) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(fd);
                }

            })
        })

            .then((fd: number) => {
                //watch whole dir for changes (to pick up new files)
                let watcher = fs.watch(this._logDir);

                //poll current logfile for changes
                let poll = setInterval(() => {
                    let stats = fs.fstatSync(fd);
                    let size = stats.size;

                    if (stats.size > this.offset) {
                        watcher.close();
                        clearInterval(poll);
                        fs.close(fd, () => { });

                        this.tailStream(`${this._logDir}/${this.currentLogFile}`, {
                            start: this.offset,
                            encoding: 'utf8'
                        });
                    }
                }, 1000);

                //respond to watcher changes
                watcher.on('change', (event: string, eventPath: string) => {
                    if (this.re.logfile.test(eventPath)) {
                        //cancel polling and watcher before going any further
                        watcher.close();
                        clearInterval(poll);

                        //Reset offset and restart tailstream if this is a new logfile 
                        //(can happen after very long game session)
                        this.offset -= this.currentLogFile === eventPath ? 0 : this.offset;
                        this.currentLogFile = eventPath;

                        //restart tailStream at offset
                        this.tailStream(`${this._logDir}/${this.currentLogFile}`, {
                            start: this.offset,
                            encoding: 'utf8'
                        });

                    }
                    //TODO: Add handling for new file types emitted by game
                    else if (/$Status.json^/.test(eventPath)) {

                    }
                    else if (/$ModulesInfo.json^/.test(eventPath)) {

                    }
                    else if (/$Outfitting.json^/.test(eventPath)) {

                    }
                    else if (/$Shipyard.json^/.test(eventPath)) {

                    }
                    else if (/$Market.json^/.test(eventPath)) {

                    }

                });
            });
    }

    private async handleEvent(data: journal.JournalEvent): Promise<any> {
        //all journal events come here to be checked for interest
        //at service level and whether should be persisted to IDB
        return new Promise((resolve, reject) => {
            switch (data.event) {

                case journal.JournalEvents.fileHeader: {
                    this._beta = /beta/i.test((<FileHeader>data).gameversion);
                    resolve(data);
                    break;
                }

                //mission accepted events
                case journal.JournalEvents.missionAccepted: {
                    this.journalDB.getEntry(journal.JournalEvents.missionAccepted, (<journal.MissionAccepted>data).MissionID).then(result => {
                        if (!result) {
                            this.journalDB.addEntry(journal.JournalEvents.missionAccepted, data)
                                .then(() => { resolve(data) })
                                .catch(err => {
                                    let report = {
                                        originalError: err,
                                        message: 'journalService.handleEvent error',
                                        data
                                    }
                                    this.logger.error(report);
                                    reject(report);
                                })
                        } else {
                            reject("Mission already exists");
                        }
                    })
                    break;
                }

                //loadgame
                case journal.JournalEvents.loadGame: {
                    let loadGame: journal.LoadGame = Object.assign(new journal.LoadGame(), data);
                    this.ngZone.run(() => this._cmdrName.next(loadGame.Commander));
                    this.journalDB.putCurrentState({ key: "cmdrName", value: loadGame.Commander })
                        .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }));
                    resolve(data);
                    break;
                }

                //new commander
                case journal.JournalEvents.newCommander: {
                    let newCommander: journal.NewCommander = Object.assign(new journal.NewCommander(), data);
                    this.ngZone.run(() => this._cmdrName.next(newCommander.Name));
                    this.journalDB.putCurrentState({ key: "cmdrName", value: newCommander.Name })
                        .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }));
                    resolve(data);
                    break;
                }

                //docked
                case journal.JournalEvents.docked: {
                    let docked: journal.Docked = Object.assign(new journal.Docked(), data);

                    this.journalDB.putCurrentState({ key: "currentSystem", value: docked.StarSystem })
                        .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }));

                    this.journalDB.putCurrentState({ key: "currentSystemAddress", value: docked.SystemAddress })
                        .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }));

                    this.ngZone.run(() => this._currentSystem.next(docked.StarSystem));
                    this.ngZone.run(() => this._currentSystemAddress.next(docked.SystemAddress));

                    if (!this.firstStream && !this.beta) {
                        let location = Object.assign(new journal.Location(), data);

                        combineLatest(
                            this.cmdrName,
                            this.currentSystemStarPos,
                            (cmdrName, starPos) => { return { cmdrName, starPos } }
                        ).pipe(
                            take(1)
                        )
                            .subscribe(combined => {
                                this.eddn.sendJournalEvent(docked, combined.cmdrName, combined.starPos);
                            })
                    }

                    resolve(data);
                    break;
                }

                //location
                case journal.JournalEvents.location: {
                    let location: journal.Location = Object.assign(new journal.Location(), data);

                    this.journalDB.putCurrentState({ key: "currentSystem", value: location.StarSystem })
                        .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }));
                    this.journalDB.putCurrentState({ key: "currentSystemStarPos", value: location.StarPos })
                        .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }));
                    this.journalDB.putCurrentState({ key: "currentSystemAddress", value: location.SystemAddress })
                        .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }));

                    this.ngZone.run(() => this._currentSystem.next(location.StarSystem));
                    this.ngZone.run(() => this._currentSystemStarPos.next(location.StarPos));
                    this.ngZone.run(() => this._currentSystemAddress.next(location.SystemAddress));

                    if (!this.firstStream && !this.beta) {
                        let location = Object.assign(new journal.Location(), data);
                        this.cmdrName.pipe(
                            take(1)
                        ).subscribe(cmdrName => {
                            this.eddn.sendJournalEvent(location, cmdrName);
                        });
                    }

                    resolve(data);
                    break;
                }

                //fsd jump
                case journal.JournalEvents.fsdJump: {

                    let fsdJump: journal.FSDJump = Object.assign(new journal.FSDJump(), data);

                    this.journalDB.putCurrentState({ key: "currentSystem", value: fsdJump.StarSystem })
                        .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }));
                    this.journalDB.putCurrentState({ key: "currentSystemAddress", value: fsdJump.SystemAddress })
                        .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }));
                    this.journalDB.putCurrentState({ key: "currentSystemStarPos", value: fsdJump.StarPos })
                        .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }));

                    this.ngZone.run(() => this._currentSystem.next(fsdJump.StarSystem));
                    this.ngZone.run(() => this._currentSystemAddress.next(fsdJump.SystemAddress));
                    this.ngZone.run(() => this._currentSystemStarPos.next(fsdJump.StarPos));

                    if (!this.firstStream && !this.beta) {
                        this._cmdrName
                            .pipe(
                                take(1)
                            )
                            .subscribe(cmdrName => {
                                this.eddn.sendJournalEvent(fsdJump, cmdrName);
                            });
                    }

                    if (fsdJump.Factions) {
                        for (let faction of fsdJump.Factions) {
                            this.journalDB.addEntry("factions", faction)
                                .catch(err => this.logger.error({
                                    originalError: err,
                                    message: "Faction failed to write to DB",
                                    data: faction
                                }));
                        }
                    }

                    resolve(data);
                    break;
                }

                //scan
                case journal.JournalEvents.scan: {
                    let scan: journal.Scan = Object.assign(new journal.Scan(), data);

                    if (!this.firstStream && !this.beta) {
                        combineLatest(
                            this.cmdrName,
                            this.currentSystem,
                            this.currentSystemAddress,
                            this.currentSystemStarPos,
                            (cmdrName, currentSystem, currentSystemAddress, currentSystemStarPos) => {
                                return { cmdrName, currentSystem, currentSystemAddress, currentSystemStarPos }
                            }
                        )
                            .pipe(
                                take(1)
                            )
                            .subscribe(combined => {
                                this.eddn.sendJournalEvent(scan, combined.cmdrName, combined.currentSystemStarPos, combined.currentSystem, combined.currentSystemAddress);
                            });
                    }
                    resolve(data);
                    break;

                }

                //supercruise entry
                case journal.JournalEvents.supercruiseEntry: {
                    let supercruiseEntry: journal.SupercruiseEntry = Object.assign(new journal.SupercruiseEntry(), data);
                    this.ngZone.run(() => this._currentSystem.next(supercruiseEntry.StarSystem));
                    this.journalDB.putCurrentState({ key: "currentSystem", value: supercruiseEntry.StarSystem })
                        .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }));

                    resolve(data);
                    break;
                }

                //supercruise exit
                case journal.JournalEvents.supercruiseExit: {
                    let supercruiseExit: journal.SupercruiseExit = Object.assign(new journal.SupercruiseExit(), data);
                    this.ngZone.run(() => this._currentSystem.next(supercruiseExit.StarSystem));

                    this.journalDB.putCurrentState({ key: "currentSystem", value: supercruiseExit.StarSystem })
                        .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }));

                    resolve(data);
                    break;
                }

                //loadout
                case journal.JournalEvents.loadout: {
                    let loadout: journal.Loadout = Object.assign(new journal.Loadout(), data);

                    this.ngZone.run(() => this._currentShipID.next(loadout.ShipID));

                    this.journalDB.putEntry('ships',loadout)
                        .catch(originalError => this.logger.error({originalError, message: "handleEvent failure"}));

                    this.journalDB.putCurrentState({key:'shipID',value: loadout.ShipID})
                        .catch(originalError => this.logger.error({originalError, message: "handleEvent failure"}));
                    
                    resolve(data);
                    break;
                }

                //resurrected
                case journal.JournalEvents.resurrect: {

                    let resurrected: journal.Resurrect = Object.assign(new journal.Resurrect(), data);

                    if (resurrected.Option !== "rebuy") {
                        this._currentShipID.pipe(
                            take(1)
                        ).subscribe(shipID => {
                            this.journalDB.deleteEntry('ships',shipID);
                            this.emit("notRebought",shipID);
                        });
                    }

                    resolve(data);
                    break;
                }

                //shipyardsell
                case journal.JournalEvents.shipyardSell: {
                    let shipyardSell: journal.ShipyardSell = Object.assign(new journal.ShipyardSell(), data);

                    this.journalDB.deleteEntry('ships',shipyardSell.SellShipID)
                        .catch(originalError => this.logger.error({originalError, message: "handleEvent failure"}));

                    resolve(data);
                    break;
                }

                default: {
                    resolve(data);
                }

            }
        })
    }

    private detectDir() {
        let defaultPath: string;
        switch (os.platform()) {
            case 'darwin': {
                defaultPath = `${app.getPath('appData')}/Frontier Developments/Elite Dangerous`;
                break;
            }
            case 'win32': {
                defaultPath = `${app.getPath('home')}/Saved Games/Frontier Developments/Elite Dangerous`;
                break;
            }
        }
        return defaultPath
    }

    private selectDirDialog() {
        let defaultPath = this.detectDir();

        let selectedDir = dialog.showOpenDialog({
            properties: ['openDirectory', 'showHiddenFiles'],
            message: 'Select Elite Dangerous log directory',
            defaultPath
        });

        return selectedDir ? selectedDir[0] : undefined;
    }


}