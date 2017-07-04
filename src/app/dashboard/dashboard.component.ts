import { Component, ChangeDetectorRef } from '@angular/core';
const fs = require('fs');
const tailingStream = require('tailing-stream');
import { JournalService } from '../journal/journal.service';
import { JournalEvents } from '../journal/journal-events.enum';

import { JournalEvent, MissionCompleted, LoadGame, NewCommander } from '../journal/models/journal-event-models';
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
                case JournalEvents.MissionCompleted: {
                    let missionCompleted: MissionCompleted = Object.assign(new MissionCompleted(), data);
                    this.missionsCompleted.push(missionCompleted);
                    break;
                }

                case JournalEvents.LoadGame: {
                    let loadGame: LoadGame = Object.assign(new LoadGame(),data);
                    this.cmdrName = loadGame.Commander;
                    break;
                }

                case JournalEvents.NewCommander: {
                    let newCommander: NewCommander = Object.assign(new NewCommander(), data);
                    this.cmdrName = newCommander.Name;
                    break;
                }
            }

        });
    }
}