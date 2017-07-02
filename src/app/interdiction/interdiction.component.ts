import { Component, OnInit } from '@angular/core';
import { JournalService } from '../journal/journal.service';
import { JournalEvents } from '../journal/journal-events.enum';
import { JournalEvent, Interdicted } from '../journal/models/journal-event-models';
import { Subscription } from 'rxjs';
import { InterdictionService } from './interdiction.service';

@Component({
    styleUrls: ['interdiction.component.scss'],
    templateUrl: 'interdiction.component.html',
    selector: 'app-interdiction'
})
export class InterdictionComponent implements OnInit {

    private journalSubscription: Subscription

    constructor(
        private journalService: JournalService,
        private interdictionService: InterdictionService
        ) { }

    ngOnInit() {
        this.journalSubscription = this.journalService.logStream
        .subscribe((data: JournalEvent)=>{
            switch (data.event) {
                case JournalEvents.Interdicted: {
                    let interdicted: Interdicted = Object.assign(new Interdicted(), data);
                    if (interdicted.IsPlayer) {
                        this.distressBeacon(interdicted);
                    }
                    break;
                }
            }
        })
    }

    distressBeacon(evt: Interdicted): void {
        this.interdictionService.interdictedAlert(evt,this.journalService.cmdrName)
    }

}