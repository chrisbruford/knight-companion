import { Component } from '@angular/core';
const fs = require('fs');
const tailingStream = require('tailing-stream');
import { JournalService } from '../journal/journal.service';
import { JournalEvents, JournalEvent, MissionCompleted, LoadGame, NewCommander } from 'cmdr-journal';
import { BehaviorSubject } from 'rxjs';

@Component({
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.scss'],
    selector: 'app-dashboard'
})
export class DashboardComponent {

    missionsCompleted: MissionCompleted[] = [];
    trackingFaction: string;
    cmdrName: BehaviorSubject<string>;

    constructor(
        private journalService: JournalService,
    ){
        this.cmdrName = journalService.cmdrName;
    }

    ngOnInit() { }

}