import { Component } from '@angular/core';
const fs = require('fs');
import { JournalService } from '../journal/journal.service';
import { JournalEvents, JournalEvent, MissionCompleted, LoadGame, NewCommander } from 'cmdr-journal';
import { Observable } from 'rxjs';

@Component({
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.scss'],
    selector: 'app-dashboard'
})
export class DashboardComponent {

    missionsCompleted: MissionCompleted[] = [];
    trackingFaction: string;
    currentSystem: Observable<string>;
    cmdrName: Observable<string>;

    constructor(
        private journalService: JournalService,
    ){
        this.cmdrName = journalService.cmdrName;
        this.currentSystem = journalService.currentSystem;
    }

    ngOnInit() { }

}