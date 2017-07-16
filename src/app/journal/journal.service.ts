import { Injectable, NgZone } from '@angular/core';
import { RE } from '../shared/services/re.service';
import * as fs from "fs";
import * as stream from "stream";
import { Observable, Subscription, Observer, Subject, BehaviorSubject } from "rxjs";
let ndjson = require('ndjson');
import { JournalEvents, JournalEvent, LoadGame, NewCommander, MissionAccepted, Docked } from 'cmdr-journal';
const { dialog } = require('electron').remote;
import { JournalDBService } from './db/journal-db.service';
import { LoggerService } from '../shared/services/logger.service';

@Injectable()
export class JournalService {

    private streamSubject: Subject<JournalEvent>;
    private offset = 0;
    private currentLogFile: string;
    private firstStream = true;
    private newFilesAvailable = true;

    private _logDir: string;
    private _beta: boolean;
    private _currentSystem: string;

    public cmdrName: BehaviorSubject<string>;


    constructor(
        private re: RE,
        private ngZone: NgZone,
        private journalDB: JournalDBService,
        private logger: LoggerService
    ) {
        this.cmdrName = new BehaviorSubject("CMDR");

        //reads all journal files and persists the data to IDB, keeps record
        //of files it's seen already so doesn't re-stream them
        let dir = this.getDir();
        this.streamSubject = new Subject();

        fs.readdir(dir, (err, files) => {

            let journalFilePaths = files.filter((path: string): boolean => {
                return this.re.logfile.test(path)
            }).sort();

            //stream all but the last file as last file will be tailstreamed
            for (let i = 0; i < journalFilePaths.length - 1; i++) {
                let path = journalFilePaths[i];
                this.journalDB.getEntry('completedJournalFiles', path)
                    .then(data => {
                        if (!data) {
                            this.streamJournalFile(`${dir}/${path}`)
                                .on('data', (data: JournalEvent) => this.handleEvent(data))
                                .on('end', () => this.journalDB.addEntry('completedJournalFiles', { filename: path }))
                        }
                    })
                    .catch(err => {
                        this.logger.error(err);
                    })
            }

            //tailstream last file
            this.currentLogFile = journalFilePaths.slice(-1)[0];
            this.tailStream(`${dir}/${this.currentLogFile}`, { start: this.offset, encoding: 'utf8' });
        });
    }

    get logDirectory() {
        return this._logDir;
    }

    get logStream(): Subject<JournalEvent> {
        return this.streamSubject;
    }

    get currentSystem(): string {
        return this._currentSystem;
    }

    get beta(): boolean {
        return this._beta;
    }

    //streams entire file, tracking offset from start, then 
    //watches for changes and re-streams from the saved offset, updating
    //offset and re-watching.
    private tailStream(path: string, options: { start: number, encoding: string }) {
        //avoid situation where logfile changes before async operations complete
        let currentLogFile = this.currentLogFile;
        this.journalDB.getEntry('completedJournalFiles', currentLogFile).then(data => {
            if (!data) { this.journalDB.addEntry('completedJournalFiles', { filename: currentLogFile }) }
        });

        let stream = fs.createReadStream(path, options)
            .on('data', (data: string) => {
                this.offset += data.length;
            })
            .pipe(ndjson.parse())
            .on('data', (data: JournalEvent) => {
                this.handleEvent(data);
                //emit events as they're occuring in-session here
                if (!this.firstStream) {
                    this.ngZone.run(() => this.streamSubject.next(data));
                }
            })

            .on('error', (err: any) => console.dir(err))

            .on('end', () => {
                //mark end of first stream so that we know future streams are for 
                //the current session
                this.firstStream = false;
                //got to end of file. Start watching for additions.
                let watcher = fs.watch(this._logDir);

                watcher.on('change', (event: string, eventPath: string) => {
                    if ((event === "rename" || event === "change") && this.re.logfile.test(eventPath)) {
                        //logfile changed. Reset offset if it's a new logfile
                        this.offset -= currentLogFile === eventPath ? 0 : this.offset;
                        this.currentLogFile = eventPath;
                        //stop watcher and restart tailStream at offset
                        watcher.close();
                        this.tailStream(`${this._logDir}/${this.currentLogFile}`, {
                            start: this.offset,
                            encoding: 'utf8'
                        })
                    }
                })

            })

        return stream;
    }

    private handleEvent(data: JournalEvent) {
        //all journal events come here to be checked for interest
        //at service level and whether should be persisted to IDB
        switch (data.event) {
            case JournalEvents.missionAccepted: {
                this.journalDB.getEntry(JournalEvents.missionAccepted, (<MissionAccepted>data).MissionID).then(result => {
                    if (!result) {
                        this.journalDB.addEntry(JournalEvents.missionAccepted, data)
                            .catch(err => {
                                let report = {
                                    originalError: err,
                                    message: 'journalService.handleEvent error',
                                    data
                                }
                                this.logger.error(report);
                            })
                    }
                })

                break;
            }
            
            case JournalEvents.loadGame: {
                let loadGame: LoadGame = Object.assign(new LoadGame(), data);
                this.cmdrName.next(loadGame.Commander);
                break;
            }
            
            case JournalEvents.newCommander: {
                let newCommander: NewCommander = Object.assign(new NewCommander(), data);
                this.cmdrName.next(newCommander.Name);
                break;
            }

            case JournalEvents.docked: {
                let docked: Docked = Object.assign(new Docked(), data);
                
            }
        }
    }

    private streamJournalFile(path: string): fs.ReadStream {
        return fs.createReadStream(path, { encoding: 'utf8' })
            .pipe(ndjson.parse({ strict: false }))
    }

    private getDir(): string {
        return this._logDir = localStorage.dir || this.selectDirDialog()[0];
    }

    private selectDirDialog() {
        let selectedDir = dialog.showOpenDialog({
            properties: ['openDirectory', 'showHiddenFiles'],
            message: 'Please select your Elite Dangerous save game directory'
        });
        if (selectedDir) { localStorage.dir = selectedDir };
        return selectedDir;
    }


}