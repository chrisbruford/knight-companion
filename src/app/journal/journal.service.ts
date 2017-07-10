import { Injectable, NgZone } from '@angular/core';
import { RE } from '../shared/services/re.service';
import * as fs from "fs";
import * as stream from "stream";
import { Observable, Subscription, Observer, Subject } from "rxjs";
let ndjson = require('ndjson');
import {JournalEvents, JournalEvent, LoadGame, NewCommander} from 'cmdr-journal';
const { dialog } = require('electron').remote;

@Injectable()
export class JournalService {

    //private streamObservable: Observable<JournalEvent>;
    private streamSubject: Subject<JournalEvent>;
    //private streamObserver: Observer<JournalEvent>;
    private offset = 0;
    private logLines: JournalEvent[] = [];
    private currentLogFile: string;
    private _logDir: string;
    private initialStream = true;
    private _cmdrName: string;
    private _beta: boolean;

    constructor(
        private re: RE,
        private ngZone: NgZone
        ) {}

    get log(): JournalEvent[] {
        return this.logLines;
    }

    get logDirectory() {
        return this._logDir;
    }

    get logStream(): Subject<JournalEvent> {
        if (!this.streamSubject) {
            this.init();
        }
        return this.streamSubject;
    }

    get cmdrName(): string {
        return this._cmdrName;
    }

    get beta(): boolean {
        return this._beta;
    }

    //initiates monitoring of the logfile directory
    //returns if already has been setup
    private init(): Subject<JournalEvent> {
        let dir = this.getDir();
        this.streamSubject = new Subject();

        //find most recent journal file
        fs.readdir(dir, (err, files) => {
            this.currentLogFile = this.getCurrentLog(err, files);
            this.tailStream(`${dir}/${this.currentLogFile}`,{start: this.offset, encoding: 'utf8'});
        });

        return this.streamSubject;     
    }

    private getCurrentLog(err: any, files: string[]): string {
        //filter to just journal files, then sort and return the last
        //(most recent) one

        //need to test for Beta files (have 'Beta' in the version of the file header) and dismiss
        if (err) return undefined
        let journalFiles = files.filter((filename: string): boolean => {
            return this.re.logfile.test(filename)
        })
        journalFiles.sort();
        return journalFiles.slice(-1)[0];
    }

    //streams entire file, tracking offset from start, then 
    //watches for changes and re-streams from the saved offset, updating
    //offset and re-watching.
    private tailStream(path:string, options: {start:number, encoding: string}) {
        let stream = fs.createReadStream(path, options)
        .on('data',(data:string)=>{
            this.offset += data.length;
        })
        .pipe(ndjson.parse())
        .on('data',(data:JournalEvent)=>{
            this.logLines.push(data);
            //we're only interested in events taking place while running so
            //don't emit events from the first stream as this is an existing
            //file
            if (!this.initialStream) {
                //.next call needs to be brought back into Angular Zone
                //to be spotted by change detection
                this.ngZone.run(()=>this.streamSubject.next(data));
            }

            //keep an eye out for some interesting events to record on the service
            switch (data.event) {
                case JournalEvents.loadGame: {
                    let loadGame: LoadGame = Object.assign(new LoadGame(), data);
                    this.ngZone.run(()=>this._cmdrName = loadGame.Commander);
                    this.ngZone.run(()=>this.streamSubject.next(data));
                    break;
                }
                case JournalEvents.newCommander: {
                    let newCommander: NewCommander = Object.assign(new NewCommander(), data);
                    this.ngZone.run(()=>this._cmdrName = newCommander.Name);
                    this.ngZone.run(()=>this.streamSubject.next(data));
                    break;
                }
            }
        })

        .on('error',(err: any)=>console.dir(err))

        .on('end',()=>{
            //mark end of first stream so that we know future streams are for 
            //the current session
            this.initialStream = false;
            //got to end of file. Start watching for additions.
            let watcher = fs.watch(this._logDir);
            
            watcher.on('change',(event:string,eventPath:string)=>{
                if ((event === "rename" || event === "change") && this.re.logfile.test(eventPath)) {
                    //logfile changed. Reset offset if it's a new logfile
                    this.offset -= this.currentLogFile === eventPath ? 0 : this.offset;
                    this.currentLogFile = eventPath;
                    //stop watcher and restart tailStream at offset
                    watcher.close();
                    this.tailStream(`${this._logDir}/${this.currentLogFile}`,{
                        start: this.offset,
                        encoding: 'utf8'
                    })
                }
            })
            
        })

        return stream;
    }

    private getDir(): string {
        return this._logDir = localStorage.dir || this.selectDirDialog()[0];
    }

    private selectDirDialog() {
        let selectedDir = dialog.showOpenDialog({
            properties: ['openDirectory','showHiddenFiles'],
            message: 'Please select your Elite Dangerous save game directory'
        });
        if (selectedDir) { localStorage.dir = selectedDir } ;
        return selectedDir;
    }


}