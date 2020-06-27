import { Injectable, NgZone } from '@angular/core';
import { RE } from '../core/services/re.service';
import * as fs from "fs";
import * as stream from "stream";
import * as os from "os";
import * as util from "util";
import { Observable, Subject, BehaviorSubject, Subscription, Observer, combineLatest } from 'rxjs';
import { first, take } from 'rxjs/operators';
let ndjson = require('ndjson');
import * as journal from 'cmdr-journal/dist';
const { dialog, app } = require('electron').remote;
import { DBService } from '../core/services/db.service';
import { LoggerService } from '../core/services/logger.service';
import { JournalQueueService } from './journalQueue.service';
import { EventEmitter } from 'events';
import { setInterval, clearInterval } from 'timers';
import { FileHeader, FSDJump, MissionCompleted, MaterialCollected, MaterialDiscarded, MaterialTrade, EngineerCraft, EngineerContribution, Synthesis, TechnologyBroker, Loadout, ScientificResearch } from 'cmdr-journal/dist';
import { EDDNService } from './eddn.service';
import { Material } from '../dashboard/materials/material.model';
import { DBStore } from '../core/enums/db-stores.enum';
import { UserService } from '../core/services';
import { KOKJournalEvents } from './kok-journal-events.enum';

@Injectable()
export class JournalService extends EventEmitter {

    private offset = 0;
    private currentLogFile: string;
    private firstStream = true;
    private _streamLive = false;
    private _directoryReadProgress = new BehaviorSubject(0);

    private _logDir: string;
    private _beta: boolean;
    private _currentStation = new BehaviorSubject<string>(null);
    private _currentSystem = new BehaviorSubject("Unknown");
    private _currentSystemAddress = new BehaviorSubject(NaN);
    private _currentSystemStarPos = new BehaviorSubject<[number, number, number]>([NaN, NaN, NaN]);
    private _cmdrName = new BehaviorSubject("Unknown CMDR");
    private _currentShipID = new BehaviorSubject(NaN);

    constructor(
        private re: RE,
        private ngZone: NgZone,
        private journalDB: DBService,
        private logger: LoggerService,
        private journalQueue: JournalQueueService,
        private eddn: EDDNService,
        private userService: UserService
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

        this.journalDB.getEntry<{ key: string, value: string }>("currentState", "currentStation")
            .then(currentStation => {
                if (currentStation && currentStation.value && typeof currentStation.value === "string") {
                    this._currentStation.next(currentStation.value);
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

        this.journalDB.getEntry<{ key: string, value: string }>("currentState", "shipID")
            .then(shipID => {
                if (shipID && shipID.value && typeof shipID.value === "number") {
                    this._currentShipID.next(shipID.value);
                }
            }).catch(err => {
                this.logger.error({
                    originalError: err,
                    message: "currentState.shipID initial setup failure"
                })
            });

        localStorage['logDir'] = this._logDir = localStorage['logDir'] || this.detectDir() || this.selectDirDialog();
        this.streamAll(this._logDir);
    }

    get logDirectory() {
        return this._logDir;
    }

    get currentStation(): Observable<string> {
        return this._currentStation.asObservable();
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

    get initialLoadProgress() {
        return this._directoryReadProgress.asObservable()
    }

    private async streamAll(dir: string) {
        if (!dir) { return }
        //reads all journal files and persists the data to IDB, keeps record
        //of files it's seen already so doesn't re-stream them
        fs.readdir(dir, async (err, files) => {
            if (!files) { return }
            let journalFilePaths = files.filter((path: string): boolean => {
                return this.re.logfile.test(path)
            }).sort();
            if (journalFilePaths.length === 0) { return }

            //stream all but the last file as last file will be tailstreamed
            this._streamLive = true;

            let journalPromises: Promise<any>[] = [];

            for (let i = 0; i < journalFilePaths.length - 1; i++) {
                let path = journalFilePaths[i];

                await this.journalDB.getEntry('completedJournalFiles', path)
                    .then(data => {
                        if (!data) {
                            let thePromise = new Promise((resolve, reject) => {
                                let stream = this.journalQueue.addPath(`${dir}/${path}`);

                                stream
                                    .on('data', (data: journal.JournalEventsUnion) => {
                                        //events need to be processed in order otherwise things like ships being sold
                                        //might be processed before the ship was purchased
                                        stream.pause();
                                        this.handleEvent(data)
                                            .then(() => stream.resume())
                                            .catch(originalError => {
                                                this.logger.error({ originalError, message: "Error in initial stream" });
                                                stream.resume();
                                            })
                                    })
                                    .on('end', () => {
                                        this.journalDB.addEntry('completedJournalFiles', { filename: path });
                                        this._directoryReadProgress.next((i + 1) / (journalFilePaths.length - 1) * 100);
                                        resolve();
                                    });
                            });
                            journalPromises.push(thePromise);
                            return thePromise;
                        }
                    })
                    .catch(err => {
                        this.logger.error(err);
                    })
            }

            //tailstream last file
            this.currentLogFile = journalFilePaths.slice(-1)[0];
            Promise.all(journalPromises)
                .then(() => {
                    this.tailStream(`${dir}/${this.currentLogFile}`, { start: this.offset, encoding: 'utf8' });
                })
                .catch(originalError => this.logger.error({ originalError, message: "Initial journal stream error" }));

        });
    }

    //streams entire file, tracking offset from start, then 
    //watches for changes and re-streams from the saved offset, updating
    //offset and re-watching.
    private tailStream(path: string, options: { start: number, encoding: string }) {
        //avoid situation where logfile changes before async operations complete
        this.journalDB.getEntry('completedJournalFiles', this.currentLogFile)
            .then(data => {
                if (!data) { this.journalDB.addEntry('completedJournalFiles', { filename: this.currentLogFile }) }
            });

        let stream = fs.createReadStream(path, options).pause()
            .on('data', (data: string) => {
                this.offset += data.length;
            })
        let newStream = this.journalQueue.addStream(stream);
        let eventHandlers: Promise<any>[] = [];
        newStream
            .on('data', (data: journal.JournalEventsUnion) => {
                newStream.pause();
                let eventHandler = this.handleEvent(data)
                    .then(() => {
                        //emit events as they're occuring in-session here
                        if (!this.firstStream) {
                            this.ngZone.run(() => this.emit(data.event, data));
                        }
                        newStream.resume();
                    })
                    .catch((reason: string) => {
                        this.logger.error({ originalError: reason, message: "handleEvent rejected in tailStream" })
                        newStream.resume();
                    });

                eventHandlers.push(eventHandler);
            })

            .on('error', (originalError: any) => this.logger.error({ originalError, message: "tailstream error" }))

            .on('end', () => {
                Promise.all(eventHandlers)
                    .catch(() => { }) //cheap Promise.finally
                    .then(() => {
                        //once here first stream must be done so
                        //we can be sure all future events are 'live'
                        //so can be emitted out
                        this.firstStream = false;
                        this.emit('ready');
                        this.watchLogDir();
                    })
            })

        return stream;
    }

    public watchLogDir(): void {
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

    private async handleEvent(data: journal.JournalEventsUnion): Promise<any> {
        //all journal events come here to be checked for interest
        //at service level and whether should be persisted to IDB
        return new Promise((resolve, reject) => {

            //check to see if this event should be ignored straight away
            this.cmdrUsernameMatch().subscribe(
                match => {
                    if (!match && data.event !== journal.JournalEvents.loadGame) { return reject('CMDR/Username Mismatch') }
                    if (this._beta && data.event !== journal.JournalEvents.fileHeader) { return reject("Ignoring BETA event"); }

                    switch (data.event) {

                        case journal.JournalEvents.fileHeader: {
                            this._beta = /beta/i.test((<FileHeader>data).gameversion);
                            resolve(data);
                            break;
                        }

                        case journal.JournalEvents.missionCompleted: {
                            if (!this.firstStream) {
                                let missionCompleted: MissionCompleted = Object.assign(new MissionCompleted(), data);
                                if (missionCompleted.MaterialsReward) {
                                    for (let material of missionCompleted.MaterialsReward) {
                                        this.journalDB.getEntry('materials', material.Name.toLowerCase())
                                            .then((existingMaterial: Material) => {
                                                let updatedMaterial: Material;
                                                if (existingMaterial) {
                                                    updatedMaterial = Object.assign(existingMaterial, material, { Count: existingMaterial.Count + material.Count });
                                                } else {
                                                    updatedMaterial = material;
                                                }
                                                updatedMaterial.Name = updatedMaterial.Name.toLowerCase();
                                                return this.journalDB.putEntry('materials', updatedMaterial).then(() => {
                                                    this.emit('materialUpdated', updatedMaterial);
                                                });
                                            })
                                    }
                                }
                            }
                            resolve(data);
                            break;
                        }

                        //mission accepted
                        case journal.JournalEvents.missionAccepted: {

                            this.journalDB.getEntry(journal.JournalEvents.missionAccepted, (<journal.MissionAccepted>data).MissionID)
                                .then(result => {
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
                                        reject({ message: "Mission already exists", data });
                                    }
                                })
                                .catch(originalError => {
                                    reject(originalError);
                                })
                            break;
                        }

                        //loadgame
                        case journal.JournalEvents.loadGame: {
                            let loadGame: journal.LoadGame = Object.assign(new journal.LoadGame(), data);
                            this.ngZone.run(() => this._cmdrName.next(loadGame.Commander));
                            this.journalDB.putCurrentState({ key: "cmdrName", value: loadGame.Commander })
                                .then(() => resolve(data))
                                .catch(originalError => {
                                    this.logger.error({ originalError, message: "handleEvent failure" });
                                    resolve(data);
                                });
                            break;
                        }

                        //new commander
                        case journal.JournalEvents.newCommander: {
                            this.ngZone.run(() => this._cmdrName.next(data.Name));
                            this.journalDB.putCurrentState({ key: "cmdrName", value: data.Name })
                                .then(() => resolve(data))
                                .catch(originalError => {
                                    this.logger.error({ originalError, message: "handleEvent failure" });
                                    resolve(data);
                                });
                            break;
                        }

                        //docked
                        case journal.JournalEvents.docked: {
                            let promises: Promise<any>[] = [];
                            let docked: journal.Docked = Object.assign(new journal.Docked(), data);

                            promises.push(this.journalDB.putCurrentState({ key: "currentStation", value: docked.StationName })
                                .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }))
                            );

                            promises.push(this.journalDB.putCurrentState({ key: "currentSystem", value: docked.StarSystem })
                                .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }))
                            );

                            promises.push(this.journalDB.putCurrentState({ key: "currentSystemAddress", value: docked.SystemAddress })
                                .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }))
                            );

                            this.ngZone.run(() => this._currentStation.next(docked.StationName));
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

                            Promise.all(promises)
                                .then(() => resolve(data))
                                .catch(originalError => {
                                    this.logger.error({ originalError, data, message: "Docked event failure" });
                                    resolve(data);
                                });

                            break;
                        }

                        //undocked
                        case journal.JournalEvents.undocked: {
                            let undocked = Object.assign(new journal.Undocked(), data);

                            let promises: Promise<any>[] = [];

                            promises.push(this.journalDB.putCurrentState({ key: "currentStation", value: null })
                                .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }))
                            );

                            Promise.all(promises)
                                .then(() => resolve(data))
                                .catch(originalError => {
                                    this.logger.error({ originalError, data, message: "Undocked event failure" });
                                    resolve(data);
                                });

                            break;
                        }

                        //location
                        case journal.JournalEvents.carrierJump:
                        case journal.JournalEvents.location: {
                            let promises: Promise<any>[] = [];

                            promises.push(
                                this.journalDB.putCurrentState({ key: "currentSystem", value: data.StarSystem })
                                    .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }))
                            );

                            promises.push(
                                this.journalDB.putCurrentState({ key: "currentSystemStarPos", value: data.StarPos })
                                    .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }))
                            );

                            promises.push(
                                this.journalDB.putCurrentState({ key: "currentSystemAddress", value: data.SystemAddress })
                                    .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }))
                            );

                            if (data.Docked && data.StationName) {
                                promises.push(
                                    this.journalDB.putCurrentState({ key: "currentStation", value: data.StationName })
                                        .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }))
                                );
                                this.ngZone.run(() => this._currentStation.next(data.StationName));
                            }
                            this.ngZone.run(() => this._currentSystem.next(data.StarSystem));
                            this.ngZone.run(() => this._currentSystemStarPos.next(data.StarPos));
                            this.ngZone.run(() => this._currentSystemAddress.next(data.SystemAddress));

                            if (!this.firstStream && !this.beta) {
                                let location = Object.assign(new journal.Location(), data);
                                this.cmdrName.pipe(
                                    take(1)
                                ).subscribe(cmdrName => {
                                    this.eddn.sendJournalEvent(location, cmdrName);
                                });
                            }

                            Promise.all(promises)
                                .then(() => resolve(data))
                                .catch(originalError => {
                                    this.logger.error({ originalError, data, message: "Location event Failure" });
                                    resolve(data);
                                });

                            break;
                        }

                        //fsd jump
                        case journal.JournalEvents.fsdJump: {
                            let promises: Promise<any>[] = [];
                            let fsdJump: journal.FSDJump = Object.assign(new journal.FSDJump(), data);

                            promises.push(
                                this.journalDB.putCurrentState({ key: "currentSystem", value: fsdJump.StarSystem })
                                    .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" })),
                                this.journalDB.putCurrentState({ key: "currentSystemAddress", value: fsdJump.SystemAddress })
                                    .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" })),
                                this.journalDB.putCurrentState({ key: "currentSystemStarPos", value: fsdJump.StarPos })
                                    .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }))
                            );

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
                                        .catch(originalError => {
                                            this.logger.error({
                                                originalError,
                                                message: "Faction failed to write to DB",
                                                data: faction
                                            })
                                        });
                                }
                            }

                            Promise.all(promises)
                                .then(() => {
                                    resolve(data)
                                })
                                .catch(originalError => {
                                    this.logger.error({ originalError, data, message: "FSDJump Event Failure" });
                                    resolve(data);
                                })
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
                                .then(() => resolve(data))
                                .catch(originalError => {
                                    this.logger.error({ originalError, message: "handleEvent failure" });
                                    resolve(data);
                                });

                            break;
                        }

                        //supercruise exit
                        case journal.JournalEvents.supercruiseExit: {
                            let supercruiseExit: journal.SupercruiseExit = Object.assign(new journal.SupercruiseExit(), data);
                            this.ngZone.run(() => this._currentSystem.next(supercruiseExit.StarSystem));

                            this.journalDB.putCurrentState({ key: "currentSystem", value: supercruiseExit.StarSystem })
                                .then(() => resolve(data))
                                .catch(originalError => {
                                    this.logger.error({ originalError, message: "handleEvent failure" });
                                    resolve(data);
                                });

                            break;
                        }

                        //loadout
                        case journal.JournalEvents.loadout: {
                            let promises: Promise<any>[] = [];
                            let loadout: journal.Loadout = Object.assign(new journal.Loadout(), data);

                            this.ngZone.run(() => this._currentShipID.next(loadout.ShipID));

                            promises.push(
                                this.journalDB.putEntry('ships', loadout)
                                    .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }))
                            );

                            promises.push(
                                this.journalDB.putCurrentState({ key: 'shipID', value: loadout.ShipID })
                                    .catch(originalError => this.logger.error({ originalError, message: "handleEvent failure" }))
                            );

                            Promise.all(promises)
                                .then(() => resolve(data))
                                .catch(originalError => {
                                    this.logger.error({ originalError, data, message: "Loadout event failure" });
                                    resolve(data);
                                })
                            break;
                        }

                        //resurrected
                        case journal.JournalEvents.resurrect: {
                            let resurrected: journal.Resurrect = Object.assign(new journal.Resurrect(), data);

                            if (resurrected.Option !== "rebuy") {
                                this._currentShipID.pipe(
                                    take(1)
                                ).subscribe(shipID => {
                                    let loadout: Loadout;
                                    this.journalDB.getEntry<Loadout>(DBStore.ships, shipID)
                                        .then((ship: Loadout) => {
                                            loadout = ship;
                                            this.journalDB.deleteEntry(DBStore.ships, shipID)
                                        })
                                        .then(() => resolve(data))
                                        .catch(originalError => {
                                            this.logger.error({ originalError, data, message: "Resurrected event failed to delete ship" });
                                            resolve(data);
                                        });
                                    this.emit(KOKJournalEvents.notRebought, loadout);
                                });
                            } else {
                                resolve(data);
                            }

                            break;
                        }

                        //shipyardsell
                        case journal.JournalEvents.shipyardSell: {
                            let shipyardSell: journal.ShipyardSell = Object.assign(new journal.ShipyardSell(), data);

                            this.journalDB.deleteEntry('ships', shipyardSell.SellShipID)
                                .then(() => resolve(data))
                                .catch(originalError => {
                                    this.logger.error({ originalError, message: "handleEvent failure" });
                                    resolve(data);
                                });

                            break;
                        }

                        //Materials
                        case journal.JournalEvents.materials: {
                            let materials: journal.Materials = Object.assign(new journal.Materials(), data);

                            //get existing materials entries from the DB and merge before re-inserting

                            //it would be too time consuming to process every historical materials event
                            //and update the DB and offer little benefit to the user
                            let promises: Promise<any>[] = [];

                            if (!this.firstStream) {

                                materials.Encoded.forEach(material => {
                                    promises.push(
                                        this.journalDB.getEntry('materials', material.Name.toLowerCase())
                                            .then(existingMaterial => {
                                                let updatedMaterial = Object.assign({ Category: "$MICRORESOURCE_CATEGORY_Encoded;" }, existingMaterial, material);
                                                updatedMaterial.Name = updatedMaterial.Name.toLowerCase();
                                                return this.journalDB.putEntry('materials', updatedMaterial)
                                                    .then(() => this.emit(KOKJournalEvents.materialUpdate, updatedMaterial));
                                            })
                                            .catch(originalError => this.logger.error({ originalError, message: "Failed to write material", data: material }))
                                    )
                                });

                                materials.Raw.forEach(material => {
                                    promises.push(
                                        this.journalDB.getEntry('materials', material.Name.toLowerCase())
                                            .then(existingMaterial => {
                                                let updatedMaterial = Object.assign({ Category: "$MICRORESOURCE_CATEGORY_Elements;" }, existingMaterial, material);
                                                updatedMaterial.Name = updatedMaterial.Name.toLowerCase();
                                                return this.journalDB.putEntry('materials', updatedMaterial)
                                                    .then(() => this.emit(KOKJournalEvents.materialUpdate, updatedMaterial));
                                            })
                                            .catch(originalError => this.logger.error({ originalError, message: "Failed to write material", data: material }))
                                    )
                                });

                                materials.Manufactured.forEach(material => {
                                    promises.push(
                                        this.journalDB.getEntry('materials', material.Name.toLowerCase())
                                            .then(existingMaterial => {
                                                let updatedMaterial = Object.assign({ Category: "$MICRORESOURCE_CATEGORY_Manufactured;" }, existingMaterial, material);
                                                updatedMaterial.Name = updatedMaterial.Name.toLowerCase();
                                                return this.journalDB.putEntry('materials', updatedMaterial)
                                                    .then(() => this.emit(KOKJournalEvents.materialUpdate, updatedMaterial));
                                            })
                                            .catch(originalError => this.logger.error({ originalError, message: "Failed to write material", data: material }))
                                    )
                                });
                            }

                            Promise.all(promises)
                                .catch(() => { }) //cheap Promise.finally
                                .then(() => {
                                    resolve(data);
                                });
                            break;
                        }

                        case journal.JournalEvents.materialCollected: {
                            if (!this.firstStream) {
                                let material: MaterialCollected = Object.assign(new MaterialCollected(), data);
                                this.journalDB.getEntry<Material>('materials', material.Name.toLowerCase())
                                    .then(existingMaterial => {
                                        let updatedMaterial: Material;
                                        if (!existingMaterial) {
                                            updatedMaterial = material;
                                        } else {
                                            updatedMaterial = Object.assign(existingMaterial, material, { Count: existingMaterial.Count + material.Count });
                                        }
                                        updatedMaterial.Name = updatedMaterial.Name.toLowerCase();
                                        return this.journalDB.putEntry('materials', updatedMaterial)
                                            .then(() => this.emit(KOKJournalEvents.materialUpdate, updatedMaterial));
                                    })
                                    .catch(originalError => this.logger.error({ originalError, message: "Failed to write material", data: material }))
                                    .then(() => {
                                        resolve(data);
                                    });
                            }
                            else {
                                resolve(data);
                            }

                            break;
                        }

                        case journal.JournalEvents.materialDiscarded: {
                            if (!this.firstStream) {
                                let materialDiscarded: MaterialDiscarded = Object.assign(new MaterialDiscarded(), data);
                                this.journalDB.getEntry<Material>('materials', materialDiscarded.Name.toLocaleLowerCase())
                                    .then(existingMaterial => {
                                        let updatedMaterial: Material;
                                        if (!existingMaterial) {
                                            updatedMaterial = Object.assign({}, materialDiscarded, { Count: existingMaterial.Count - materialDiscarded.Count })
                                        } else {
                                            updatedMaterial = Object.assign(existingMaterial, materialDiscarded, { Count: existingMaterial.Count - materialDiscarded.Count });
                                        }
                                        updatedMaterial.Name = updatedMaterial.Name.toLowerCase();
                                        return this.journalDB.putEntry('materials', updatedMaterial)
                                            .then(() => this.emit(KOKJournalEvents.materialUpdate, updatedMaterial));
                                    })
                                    .catch(originalError => this.logger.error({ originalError, message: "Failed to write material", data: materialDiscarded }))
                                    .then(() => {
                                        resolve(data);
                                    });
                            } else {
                                resolve(data);
                            }
                            break;
                        }

                        case journal.JournalEvents.materialTrade: {
                            if (!this.firstStream) {
                                let promises: Promise<any>[] = [];
                                let materialTrade: MaterialTrade = Object.assign(new MaterialTrade(), data);
                                //Increase materials received
                                promises.push(
                                    this.journalDB.getEntry<Material>('materials', materialTrade.Received.Material.toLocaleLowerCase())
                                        .then(existingMaterial => {
                                            let updatedMaterial: Material;
                                            if (!existingMaterial) {
                                                updatedMaterial = new Material();
                                                updatedMaterial.Name = materialTrade.Received.Material;
                                                updatedMaterial.Name_Localised = materialTrade.Received.Material_Localised;
                                                updatedMaterial.Category = materialTrade.Received.Category;
                                                updatedMaterial.Category_Localised = materialTrade.Received.Category_Localised;
                                                updatedMaterial.Count = materialTrade.Received.Quantity;
                                            } else {
                                                updatedMaterial = Object.assign(existingMaterial, { Count: existingMaterial.Count || 0 + materialTrade.Received.Quantity });
                                            }
                                            updatedMaterial.Name = updatedMaterial.Name.toLowerCase();
                                            return this.journalDB.putEntry('materials', updatedMaterial)
                                                .then(() => this.emit(KOKJournalEvents.materialUpdate, updatedMaterial));
                                        })
                                        .catch(originalError => this.logger.error({ originalError, message: "Failed to write material", data: materialTrade }))
                                );

                                //Decrease materials paid
                                promises.push(
                                    this.journalDB.getEntry<Material>('materials', materialTrade.Paid.Material.toLocaleLowerCase())
                                        .then(existingMaterial => {
                                            let updatedMaterial = Object.assign(existingMaterial, { Count: existingMaterial.Count - materialTrade.Paid.Quantity });
                                            updatedMaterial.Name = updatedMaterial.Name.toLowerCase();
                                            return this.journalDB.putEntry('materials', updatedMaterial)
                                                .then(() => this.emit(KOKJournalEvents.materialUpdate, updatedMaterial));
                                        })
                                        .catch(originalError => this.logger.error({ originalError, message: "Failed to write material", data: materialTrade }))
                                );
                                Promise.all(promises)
                                    .catch(() => { }) //cheap Promise.finally
                                    .then(() => {
                                        resolve(data);
                                    });

                            }
                            else {
                                resolve(data);
                            }

                            break;
                        }

                        case journal.JournalEvents.engineerCraft: {
                            if (!this.firstStream) {
                                let engineerCraft: EngineerCraft = Object.assign(new EngineerCraft(), data);
                                let promises: Promise<any>[] = [];

                                for (let material of engineerCraft.Ingredients) {
                                    promises.push(
                                        this.journalDB.getEntry<Material>('materials', material.Name.toLocaleLowerCase())
                                            .then(existingMaterial => {
                                                let updatedMaterial = Object.assign(existingMaterial, material, { Count: existingMaterial.Count - material.Count });
                                                updatedMaterial.Name = updatedMaterial.Name.toLowerCase();
                                                return this.journalDB.putEntry('materials', updatedMaterial)
                                                    .then(() => this.emit(KOKJournalEvents.materialUpdate, updatedMaterial));
                                            })
                                            .catch(originalError => this.logger.error({ originalError, message: "Failed to write material", data: engineerCraft }))
                                    );
                                }

                                Promise.all(promises)
                                    .catch(() => { }) //cheap Promise.finally
                                    .then(() => {
                                        resolve(data);
                                    });
                            } else {
                                resolve(data);
                            }
                            break;
                        }

                        case journal.JournalEvents.engineerContribution: {
                            if (!this.firstStream) {
                                let engineerContribution: EngineerContribution = Object.assign(new EngineerContribution(), data);
                                if (engineerContribution.Material) {
                                    this.journalDB.getEntry<Material>('materials', engineerContribution.Material.toLocaleLowerCase())
                                        .then(existingMaterial => {
                                            let updatedMaterial = Object.assign(existingMaterial, { Count: existingMaterial.Count - engineerContribution.Quantity });
                                            updatedMaterial.Name = updatedMaterial.Name.toLowerCase();
                                            return this.journalDB.putEntry('materials', updatedMaterial)
                                                .then(() => this.emit(KOKJournalEvents.materialUpdate, updatedMaterial));
                                        })
                                        .catch(originalError => this.logger.error({ originalError, message: "Failed to write material", data: engineerContribution }))
                                        .then(() => {
                                            resolve(data);
                                        });
                                } else {
                                    resolve(data);
                                }
                            } else {
                                resolve(data);
                            }


                            break;
                        }

                        case journal.JournalEvents.synthesis: {
                            if (!this.firstStream) {
                                let synthesis: Synthesis = Object.assign(new Synthesis(), data);
                                let promises: Promise<any>[] = [];

                                for (let material of synthesis.Materials) {
                                    promises.push(
                                        this.journalDB.getEntry<Material>('materials', material.Name.toLowerCase())
                                            .then(existingMaterial => {
                                                let updatedMaterial = Object.assign(existingMaterial, material, { Count: existingMaterial.Count - material.Count });
                                                updatedMaterial.Name = updatedMaterial.Name.toLowerCase();
                                                return this.journalDB.putEntry('materials', updatedMaterial)
                                                    .then(() => this.emit(KOKJournalEvents.materialUpdate, updatedMaterial));
                                            })
                                            .catch(originalError => this.logger.error({ originalError, message: "Failed to write material", data: synthesis }))
                                    );
                                }

                                Promise.all(promises)
                                    .catch(() => { }) //cheap Promise.finally
                                    .then(() => resolve(data));
                            } else {
                                resolve(data);
                            }

                            break;
                        }

                        case journal.JournalEvents.scientificResearch: {
                            if (!this.firstStream) {
                                let scientificResearch: ScientificResearch = Object.assign(new ScientificResearch(), data);
                                this.journalDB.getEntry<Material>(DBStore.materials, scientificResearch.Name.toLowerCase())
                                    .then(existingMaterial => {
                                        existingMaterial.Count -= scientificResearch.Count;
                                        return this.journalDB.putEntry(DBStore.materials, existingMaterial)
                                            .then(() => {
                                                this.emit(KOKJournalEvents.materialUpdate, existingMaterial)
                                            })
                                    })
                                    .catch(originalError => this.logger.error({ originalError, message: "Failed to write material", data: scientificResearch }))
                            } else {
                                resolve(data);
                            }

                            break;
                        }

                        case journal.JournalEvents.technologyBroker: {
                            if (!this.firstStream) {
                                let technologyBroker: TechnologyBroker = Object.assign(new TechnologyBroker(), data);
                                let promises: Promise<any>[] = [];

                                for (let material of technologyBroker.Materials) {
                                    promises.push(
                                        this.journalDB.getEntry<Material>('materials', material.Name.toLocaleLowerCase())
                                            .then(existingMaterial => {
                                                let updatedMaterial = Object.assign(existingMaterial, material, { Count: existingMaterial.Count - material.Count });
                                                updatedMaterial.Name = updatedMaterial.Name.toLowerCase();
                                                return this.journalDB.putEntry('materials', updatedMaterial)
                                                    .then(() => this.emit(KOKJournalEvents.materialUpdate, updatedMaterial));
                                            })
                                            .catch(originalError => this.logger.error({ originalError, message: "Failed to write material", data: technologyBroker }))
                                    );
                                }

                                Promise.all(promises)
                                    .catch(() => { })
                                    .then(() => {
                                        resolve(data);
                                    });
                            } else {
                                resolve(data);
                            }

                            break;
                        }

                        default: {
                            resolve(data);
                        }

                    }
                },
                error => reject(error)
            )
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

    private cmdrUsernameMatch() {
        return combineLatest(
            this.userService.user,
            this.cmdrName,
            (user, cmdrName) => user.username.toLowerCase() === cmdrName.toLowerCase())
            .pipe(take(1))
    }


}