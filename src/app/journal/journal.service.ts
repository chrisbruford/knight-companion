import { Injectable, NgZone } from '@angular/core';
import { RE } from '../shared/services/re.service';
import * as fs from "fs";
import * as stream from "stream";
import { Observable, Subscription, Observer } from "rxjs";
let ndjson = require('ndjson');

@Injectable()
export class JournalService {

    streamObservable: Observable<string>;
    streamObserver: Observer<string>;
    offset = 0;
    logLines: string[] = [];
    currentLogFile: string;
    logDir: string;

    constructor(
        private re: RE,
        private ngZone: NgZone
        ) {}

    monitor(dir: string): Observable<string> {
        this.logDir = dir;
        this.streamObservable = Observable.create((observer: Observer<string>)=>{
            this.streamObserver = observer;
        })

        //find most recent journal file
        fs.readdir(dir, (err, files) => {
            this.currentLogFile = this.getCurrentLog(err, files);
            this.tailStream(`${dir}/${this.currentLogFile}`,{start: this.offset, encoding: 'utf8'});
        });
        
        return this.streamObservable;
        
    }

    getCurrentLog(err: any, files: string[]): string {
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
    tailStream(path:string, options: {start:number, encoding: string}) {
        let stream = fs.createReadStream(path, options)
        //sets offset based on chars streamed from file so far
        //so next stream resumes where this one leaves off
        .on('data',(data:string)=>{
            this.offset += data.length;
        })
        //parse chars into Objects
        .pipe(ndjson.parse())
        //handle parsed objects
        .on('data',(data:string)=>{
            this.logLines.push(data);
            //.next call needs to be brought back into Angular Zone
            //to be spotted by change detection
            this.ngZone.run(()=>this.streamObserver.next(data));
        })

        .on('end',()=>{
            //got to end of file. Start watching for additions.
            let watcher = fs.watch(this.logDir);
            
            watcher.on('change',(event:string,eventPath:string)=>{
                if ((event === "rename" || event === "change") && this.re.logfile.test(eventPath)) {
                    //logfile changed. Reset offset if it's a new logfile
                    this.offset -= this.currentLogFile === eventPath ? 0 : this.offset;
                    this.currentLogFile = eventPath;
                    //stop watcher and restart tailStream at offset
                    watcher.close();
                    this.tailStream(`${this.logDir}/${this.currentLogFile}`,{
                        start: this.offset,
                        encoding: 'utf8'
                    })
                }
            })
            
        })

        return stream;
    }


}