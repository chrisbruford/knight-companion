import { Component } from '@angular/core';
import * as fs from 'fs';
const tailingStream: any = require('tailing-stream');
import { JournalService } from '../../journal/journal.service';
import { JournalEvents, JournalEvent, MissionCompleted, LoadGame, NewCommander } from 'cmdr-journal';
import { Subscription } from 'rxjs';

@Component({
    templateUrl: 'missions.component.html',
    styleUrls: ['missions.component.scss'],
    selector: 'app-missions',
    providers: [JournalService]
})
export class MissionsComponent {

    missionsCompleted: MissionCompleted[] = [];
    trackingFaction: string;
    journalSubscription: Subscription;
    cmdrName: string;

    constructor(
        private journalService: JournalService
    ){}

    ngOnInit() {
       this.watchDir();
    }

    watchDir() {
        this.journalSubscription = this.journalService.logStream
        .subscribe((data:JournalEvent)=>{
            switch (data.event) {
                case JournalEvents.missionCompleted: {
                    let missionCompleted: MissionCompleted = Object.assign(new MissionCompleted(), data);
                    this.missionsCompleted.push(missionCompleted);
                    break;
                }
            }

        });
    }
}