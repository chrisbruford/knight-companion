import { Component, OnDestroy, OnInit } from '@angular/core';
const fs = require('fs');
import { JournalService } from '../journal/journal.service';
import { JournalEvents, JournalEvent, MissionCompleted, LoadGame, NewCommander } from 'cmdr-journal';
import { Observable, combineLatest, of } from 'rxjs';
import { map, merge, tap, takeWhile, debounceTime, take } from 'rxjs/operators';
import { FactionService } from '../core/services/faction.service';
import { Faction } from 'cmdr-journal';
import { LoggerService } from '../core/services/logger.service';
import { FormControl } from '@angular/forms';
import { UserService } from '../core/services/user.service';
import { AppErrorService } from '../core/services/app-error.service';
import { MatTabChangeEvent } from '@angular/material';
import { MissionService } from './missions/mission.service';
import { TrackingFaction } from './tracking-faction.service';

@Component({
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.scss'],
    selector: 'app-dashboard'
})
export class DashboardComponent implements OnDestroy, OnInit {

    missionsCompleted: MissionCompleted[] = [];
    trackingFaction = new FormControl;
    currentSystem: Observable<string>;
    cmdrName: string;
    username: string;
    knownFactions: Faction[];
    filteredKnownFactions: Observable<Faction[]>;
    selectedDashboardTab: number;
    private alive = true;


    constructor(
        private journalService: JournalService,
        private factionService: FactionService,
        private logger: LoggerService,
        private userService: UserService,
        private appErrorService: AppErrorService,
        private missionService: MissionService,
        private trackedFaction: TrackingFaction
    ) {
        this.currentSystem = journalService.currentSystem;
    }

    ngOnInit() {
        try {
            this.selectedDashboardTab = Number.parseInt(localStorage.getItem("selectedDashboardTab"));
        } catch (err) {
            this.logger.error(err);
            this.selectedDashboardTab = 0;
        }

        //username/cmdrname check
        this.journalService.cmdrName
            .pipe(
                takeWhile(() => this.alive)
            )
            .subscribe(cmdrName => {
                if (cmdrName) {
                    this.cmdrName = cmdrName;
                } else {
                    this.appErrorService.removeError("cmdrNameMismatch");
                }
            });

        this.userService.user
            .pipe(takeWhile(() => this.alive))
            .subscribe(user => {
                if (user) {
                    this.username = user.username;
                    if (!user.discordID || !user.discordID.length) {
                        this.appErrorService.addError("no-discord", { message: `️️️️️️️⚠️️️️Your account has not been linked with Discord` });
                    } else {
                        this.appErrorService.removeError("no-discord");
                    }
                } else {
                    this.appErrorService.removeError("cmdrNameMismatch");
                    this.appErrorService.removeError("no-discord");
                }
            });

        combineLatest(
            this.userService.user,
            this.journalService.cmdrName,
            (user, cmdrName) => {
                return { user, cmdrName }
            })
            .pipe(takeWhile(() => this.alive))
            .subscribe(() => this.checkNameMismatch);

        this.trackedFaction.faction
            .pipe(take(1))
            .subscribe(faction => {
                this.trackingFaction.setValue(faction);
                this.trackingFaction.valueChanges
                    .pipe(
                        debounceTime(500),
                        tap(inputValue => {
                            this.trackedFaction.setFaction(inputValue);
                        }),
                        map(inputValue => {
                            let outputArray = this.knownFactions.filter(faction => {
                                let escapedInputValue = inputValue.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                                let re = new RegExp(`${escapedInputValue}`, "i");
                                return re.test(faction.Name);
                            });
                            return of(outputArray);
                        }),
                        takeWhile(() => this.alive)
                    )
                    .subscribe(filteredKnownFactions => {
                        this.filteredKnownFactions = filteredKnownFactions;

                    });
            });

        this.factionService.getAllFactions()
            .then(factions => {
                this.knownFactions = factions
            })
            .catch(err => this.logger.error({
                originalError: err,
                message: "Error fetching all known factions in dashboard component"
            }));
    }

    checkNameMismatch() {

        if (this.cmdrName.toLowerCase() !== this.username.toLowerCase()) {
            this.appErrorService.addError("cmdrNameMismatch", { message: `⚠️️️️You are logged in as ${this.username} but appear to be playing as ${this.cmdrName}` });
        } else {
            this.appErrorService.removeError("cmdrNameMismatch");
        }
    }

    doTabChange(e: MatTabChangeEvent) {
        localStorage.setItem("selectedDashboardTab", e.index.toString());
    }

    ngOnDestroy() {
        this.alive = false;
    }
}