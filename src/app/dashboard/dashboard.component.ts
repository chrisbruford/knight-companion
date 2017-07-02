import { Component } from '@angular/core';
import { JournalService } from '../journal/journal.service';
const { dialog } = require('electron').remote;
const fs = require('fs');
const tailingStream = require('tailing-stream');
import { JournalEvents } from '../journal/journal-events.enum';
import { MissionCompleted } from '../journal/models/mission-completed.model';
import { ChangeDetectorRef } from '@angular/core';
import { Observable, Observer } from 'rxjs';

@Component({
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.scss'],
    selector: 'app-dashboard',
    providers: [JournalService]
})
export class DashboardComponent {

    dir: string;
    currentLogFile: string;
    missionsCompleted: any[] = [];

    constructor(
        private journalService: JournalService,
        private ref: ChangeDetectorRef
    ){}

    ngOnInit() {
        this.getDir();
        if (this.dir) { this.watchDir(this.dir) }
    }

    getDir() {
        this.dir = localStorage.dir || this.selectDirDialog()[0];
    }

    selectDirDialog() {
        let selectedDir = dialog.showOpenDialog({
            properties: ['openDirectory','showHiddenFiles'],
            message: 'Please select your Elite Dangerous save game directory'
        });
        if (selectedDir) { localStorage.dir = selectedDir } ;
        return selectedDir;
    }

    watchDir(dir: string) {
        this.journalService.monitor(this.dir).subscribe((data:any)=>{
            //handle log events
            switch (data.event) {
                case JournalEvents.MissionCompleted: {
                    let missionCompleted: MissionCompleted = Object.assign(new MissionCompleted(), data);
                    this.missionsCompleted.push(missionCompleted);
                }
            }

        });
    }
}