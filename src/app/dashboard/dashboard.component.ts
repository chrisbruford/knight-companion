import { Component } from '@angular/core';
import { JournalService } from '../shared/services/journal.service';
const { dialog } = require('electron').remote;
const fs = require('fs');
//const chokidar = require('chokidar');
const tailingStream = require('tailing-stream');


@Component({
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.scss'],
    selector: 'app-dashboard',
    providers: [JournalService]
})
export class DashboardComponent {

    dir: string;
    currentLogFile: string;

    constructor(
        private journalService: JournalService
    ){}

    ngOnInit() {
        this.getDir();
    }

    getDir() {
        this.dir = localStorage.dir || this.selectDirDialog();
        if (this.dir) { this.watchDir(this.dir) }
    }

    selectDirDialog() {
        let selectedDir = dialog.showOpenDialog({properties: ['openDirectory','showHiddenFiles']});
        if (selectedDir) { localStorage.dir = selectedDir } ;
        return selectedDir;
    }

    watchDir(dir: string) {
        this.journalService.monitor(this.dir).then(logFile=>{
            this.currentLogFile=logFile
            console.log(this.currentLogFile);
        });
    }
}