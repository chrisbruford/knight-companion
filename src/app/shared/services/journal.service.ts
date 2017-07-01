import { Injectable } from '@angular/core';
import { RE } from './re.service';
import * as fs from "fs";
import * as stream from "stream";
import { Observable, Subscription, Observer } from "rxjs";

@Injectable()
export class JournalService {

    streamObservable: Observable<string>;
    streamObserver: Observer<string>;
    offset = 0;
    logLines: string[] = [];
    currentLogFile: string;
    logDir: string;

    constructor(private re: RE) {}

    monitor(dir: string): Observable<string> {
        this.logDir = dir;
        this.streamObserver = Observable.create((observer: Observer<string>)=>{
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
                let stream = fs.createReadStream(path, options);
                
                stream.on('data',(data:string)=>{
                    this.logLines.push(data);
                    this.offset += data.length;
                    this.streamObserver.next(data);
                })

                stream.on('end',()=>{
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
                        } else {
                            console.log('no match');
                        }
                    })
                    
                })

                return stream;
            }


}