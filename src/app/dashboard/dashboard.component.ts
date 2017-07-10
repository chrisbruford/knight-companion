import { Component } from '@angular/core';
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
    ){}

    ngOnInit() {
       this.watchDir();
    }

    watchDir() {
        this.journalSubscription = this.journalService.logStream
        .subscribe((data:JournalEvent)=>{
            //handle log events
            switch (data.event) {
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