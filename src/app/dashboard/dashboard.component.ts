import { Component } from '@angular/core';
const fs = require('fs');
import { JournalService } from '../journal/journal.service';
import { JournalEvents, JournalEvent, MissionCompleted, LoadGame, NewCommander } from 'cmdr-journal';
import { Observable } from 'rxjs/observable';
import { map } from 'rxjs/operators/map';
import { of } from 'rxjs/observable/of';
import { FactionService } from '../core/services/faction.service';
import { Faction } from 'cmdr-journal';
import { LoggerService } from '../core/services/logger.service';
import { FormControl } from '@angular/forms';

@Component({
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.scss'],
    selector: 'app-dashboard'
})
export class DashboardComponent {

    missionsCompleted: MissionCompleted[] = [];
    trackingFaction = new FormControl;
    currentSystem: Observable<string>;
    cmdrName: Observable<string>;
    knownFactions: Faction[];
    filteredKnownFactions: Observable<Faction[]>;

    constructor(
        private journalService: JournalService,
        private factionService: FactionService,
        private logger: LoggerService
    ){
        this.cmdrName = journalService.cmdrName;
        this.currentSystem = journalService.currentSystem;
    }

    ngOnInit() {
        this.trackingFaction.setValue("");

        this.factionService.getAllFactions()
            .then(factions=>{
                this.knownFactions = factions
            })
            .catch(err=>this.logger.error({
                originalError: err,
                message: "Error fetching all known factions in dashboard component"
            }));

        this.trackingFaction.valueChanges.pipe(
            map(inputValue=>{
                let outputArray = this.knownFactions.filter(faction=>{
                    let escapedInputValue = inputValue.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    let re = new RegExp(`${escapedInputValue}`,"i");
                    return re.test(faction.Name);
                });
                return of(outputArray);
            })
        ).subscribe(filteredKnownFactions => this.filteredKnownFactions = filteredKnownFactions);
     }
}