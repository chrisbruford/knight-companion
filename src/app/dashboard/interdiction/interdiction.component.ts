import { Component, OnInit, Input } from '@angular/core';
import { JournalService } from '../../journal/journal.service';
import { JournalEvents, JournalEvent, Interdicted } from 'cmdr-journal';
import { Subscription } from 'rxjs';
import { InterdictionService } from './interdiction.service';

@Component({
    styleUrls: ['interdiction.component.scss'],
    templateUrl: 'interdiction.component.html',
    selector: 'app-interdiction'
})
export class InterdictionComponent implements OnInit {

    private journalSubscription: Subscription;
    private cmdrName: string;
    private currentSystem: string;
    

    constructor(
        private journalService: JournalService,
        private interdictionService: InterdictionService
        ) { }

    ngOnInit() {
        this.journalSubscription = this.journalService.logStream
        .subscribe((data: JournalEvent)=>{
            switch (data.event) {
                case JournalEvents.interdicted: {
                    let interdicted: Interdicted = Object.assign(new Interdicted(), data);
                    if (interdicted.IsPlayer) {
                        this.distressBeacon(interdicted);
                    }
                    break;
                }
            }
        });

        this.journalService.currentSystem.subscribe(system=>{
            this.currentSystem = system;
        })

        this.journalService.cmdrName.subscribe(name=>{
            this.cmdrName = name;
        })
    }

    distressBeacon(evt: Interdicted): void {
        this.interdictionService.interdictedAlert(evt,this.cmdrName,this.currentSystem).subscribe(res=>console.log(res));
    }

}