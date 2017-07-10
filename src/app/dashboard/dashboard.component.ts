import { Component, ChangeDetectorRef } from '@angular/core';
const fs = require('fs');
const tailingStream = require('tailing-stream');
import { JournalService } from '../journal/journal.service';
import { JournalEvents, JournalEvent, MissionCompleted, LoadGame, NewCommander } from 'cmdr-journal';
import { Subscription } from 'rxjs';

@Component({
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.scss'],
    selector: 'app-dashboard',
    providers: [JournalService]
})
export class DashboardComponent {

    missionsCompleted: MissionCompleted[] = [];
    trackingFaction: string;
    journalSubscription: Subscription;
    cmdrName: string;

    constructor(
        private journalService: JournalService,
        private ref: ChangeDetectorRef
    ){}

    ngOnInit() {
       this.watchDir();
    }

    watchDir() {
        this.journalSubscription = this.journalService.logStream
        .subscribe((data:JournalEvent)=>{
            //handle log events
            switch (data.event) {
                case JournalEvents.missionCompleted: {
                    let missionCompleted: MissionCompleted = Object.assign(new MissionCompleted(), data);
                    this.missionsCompleted.push(missionCompleted);
                    break;
                }

                case JournalEvents.loadGame: {
                    let loadGame: LoadGame = Object.assign(new LoadGame(),data);
                    this.cmdrName = loadGame.Commander;
                    break;
                }

                case JournalEvents.newCommander: {
                    let newCommander: NewCommander = Object.assign(new NewCommander(), data);
                    this.cmdrName = newCommander.Name;
                    break;
                }
            }

        });
    }
}