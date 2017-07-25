import { Injectable } from '@angular/core';
import * as journal from 'cmdr-journal';
import * as fs from 'fs';
import { Observable, Observer } from 'rxjs';
let ndjson = require('ndjson');

@Injectable()
export class JournalQueueService {
    private logFileQueue: Array<fs.ReadStream> = [];
    private observable: Observable<fs.ReadStream>;
    private observer: Observer<fs.ReadStream>;
    private digesting = false;

    constructor() { 
        this.observable = Observable.create((observer: Observer<fs.ReadStream>)=>{
            this.observer = observer;            
        })
    }

    addPath(path: string) {
        let stream = fs.createReadStream(path, { encoding: 'utf8' }).pause().pipe(ndjson.parse({ strict: false }));
        this.logFileQueue.push(stream);
        this.digestQueue();
        return stream;
    }

    addStream(stream: fs.ReadStream) {
        stream = stream.pause().pipe(ndjson.parse({ strict: false }));
        this.logFileQueue.push(stream);
        this.digestQueue();
        return stream;
    }

    digestQueue() {
        if (this.digesting || this.logFileQueue.length === 0) { return }
        this.digesting = true;
        let stream = this.logFileQueue.shift();
        stream.on('end',()=>{
            this.digesting = false;
            this.digestQueue();
        }).resume();
    }
    
}