import { Injectable } from '@angular/core';
import * as stream from 'stream';
import * as fs from 'fs';

@Injectable()
export class JournalStreamService extends stream.Readable {

    stream: fs.ReadStream;

    constructor(private options:stream.ReadableOptions, private path: string) {
        super(options);
        this.stream = fs.createReadStream(path,options);
    }

    _read(size: number): void {
        this.stream.on('data',(data:string)=>{
            this.push(data);
        })
    }
    
}