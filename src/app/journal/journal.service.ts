import { Injectable, NgZone } from '@angular/core';
import { RE } from '../shared/services/re.service';
import * as fs from "fs";
import * as stream from "stream";
import * as os from "os";
import { Observable, Subscription, Observer, Subject, BehaviorSubject } from "rxjs";
let ndjson = require('ndjson');
import * as journal from 'cmdr-journal';
const { dialog, app } = require('electron').remote;
import { JournalDBService } from './db/journal-db.service';
import { LoggerService } from '../shared/services/logger.service';
import { JournalQueueService } from './journalQueue.service';
import { EventEmitter } from 'events';

@Injectable()
export class JournalService extends EventEmitter {

    private offset = 0;
    private currentLogFile: string;
    private firstStream = true;
    private _streamLive = false;

    private _logDir: string;
    private _beta: boolean;
    private _currentSystem: BehaviorSubject<string> = new BehaviorSubject(localStorage.currentSystem || "Unknown");
    private _cmdrName: BehaviorSubject<string> = new BehaviorSubject(localStorage.cmdrName || "CMDR");

    constructor(
        private re: RE,
        private ngZone: NgZone,
        private journalDB: JournalDBService,
        private logger: LoggerService,
        private journalQueue: JournalQueueService
    ) {
        super();
        localStorage.logDir = this._logDir = localStorage.logDir || this.detectDir() || this.selectDirDialog();
        this.streamAll(this._logDir);
        
    }

    get logDirectory() {
        return this._logDir;
    }

    get currentSystem(): Observable<string> {
        return this._currentSystem.asObservable();
    }

    get cmdrName(): Observable<string> {
        return this._cmdrName.asObservable();
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

            .on('error', (err: any) => console.dir(err))

            .on('end', () => this.watchLogDir())

        return stream;
    }

    public watchLogDir(): void {
        let watcher = fs.watch(this._logDir);

        watcher.on('change', (event: string, eventPath: string) => {
            //mark end of first stream so that we know future streams are for 
            //the current session
            this.firstStream = false;
            if ((event === "rename" || event === "change") && this.re.logfile.test(eventPath)) {
                //logfile changed. Reset offset if it's a new logfile
                this.offset -= this.currentLogFile === eventPath ? 0 : this.offset;
                this.currentLogFile = eventPath;
                //stop watcher and restart tailStream at offset
                watcher.close();
                this.tailStream(`${this._logDir}/${this.currentLogFile}`, {
                    start: this.offset,
                    encoding: 'utf8'
                })
            }
        })
    }

    private async handleEvent(data: journal.JournalEvent): Promise<any> {
        //all journal events come here to be checked for interest
        //at service level and whether should be persisted to IDB
        return new Promise((resolve, reject) => {
            switch (data.event) {
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

                case journal.JournalEvents.loadGame: {
                    let loadGame: journal.LoadGame = Object.assign(new journal.LoadGame(), data);
                    this.ngZone.run(() => this._cmdrName.next(loadGame.Commander));
                    localStorage.cmdrName = loadGame.Commander;
                    resolve(data);
                    break;
                }

                case journal.JournalEvents.newCommander: {
                    let newCommander: journal.NewCommander = Object.assign(new journal.NewCommander(), data);
                    this.ngZone.run(() => this._cmdrName.next(newCommander.Name));
                    localStorage.cmdrName = newCommander.Name;
                    resolve(data);
                    break;
                }

                case journal.JournalEvents.docked: {
                    let docked: journal.Docked = Object.assign(new journal.Docked(), data);
                    this.ngZone.run(() => this._currentSystem.next(docked.StarSystem));
                    localStorage.currentSystem = docked.StarSystem;
                    resolve(data);
                    break;
                }

                case journal.JournalEvents.location: {
                    let location: journal.Location = Object.assign(new journal.Location(), data);
                    this.ngZone.run(() => this._currentSystem.next(location.StarSystem));
                    localStorage.currentSystem = location.StarSystem;
                    resolve(data);
                    break;
                }

                case journal.JournalEvents.fsdJump: {
                    let fsdJump: journal.FSDJump = Object.assign(new journal.FSDJump(), data);
                    this.ngZone.run(() => this._currentSystem.next(fsdJump.StarSystem));
                    localStorage.currentSystem = fsdJump.StarSystem;
                    resolve(data);
                    break;
                }

                case journal.JournalEvents.supercruiseEntry: {
                    let supercruiseEntry: journal.SupercruiseEntry = Object.assign(new journal.SupercruiseEntry(), data);
                    this.ngZone.run(() => this._currentSystem.next(supercruiseEntry.Starsystem));
                    localStorage.currentSystem = supercruiseEntry.Starsystem;
                    resolve(data);
                    break;
                }

                case journal.JournalEvents.supercruiseExit: {
                    let supercruiseExit: journal.SupercruiseExit = Object.assign(new journal.SupercruiseExit(), data);
                    this.ngZone.run(() => this._currentSystem.next(supercruiseExit.Starsystem));
                    localStorage.currentSystem = supercruiseExit.Starsystem;
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

        return selectedDir ? selectedDir[0]:undefined;
    }


}