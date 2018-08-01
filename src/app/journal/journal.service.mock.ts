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
import { FileHeader, FSDJump, MissionCompleted, MaterialCollected, MaterialDiscarded, MaterialTrade, EngineerCraft, EngineerContribution, Synthesis, TechnologyBroker } from 'cmdr-journal/dist';
import { EDDNService } from './eddn.service';
import { Material } from '../dashboard/materials/material.model';

@Injectable()
export class FakeJournalService extends EventEmitter {

    private offset = 0;
    private currentLogFile = '';
    private firstStream = true;
    private _streamLive = false;
    private _directoryReadProgress = new BehaviorSubject(0);

    private _logDir = '';
    private _beta = false;
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
        private eddn: EDDNService
    ) {
        super();
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

    get initialLoadProgress() { 
        return this._directoryReadProgress.asObservable() 
    }

    private async streamAll(dir: string) {
        
    }

    private tailStream(path: string, options: { start: number, encoding: string }) {
        return new stream.Readable();
    }

    public watchLogDir(): void {

    }

    private async handleEvent(data: journal.JournalEvent): Promise<any> {
        return Promise.resolve(data);
    }

    private detectDir() {
        return '';
    }

    private selectDirDialog() {
        return '';
    }


}