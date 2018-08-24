import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { JournalService } from '../../journal/journal.service';
import { DBService } from '../../core/services/db.service';
import { JournalEvents, JournalEvent, MissionCompleted, MissionAccepted, MissionAbandoned, MissionFailed, LoadGame, NewCommander } from 'cmdr-journal/dist';
import { Subscription, Observable } from 'rxjs';
import { OriginatedMission } from './originatedMission';
import { MissionService } from '../../journal/handlers/mission.service';
import { takeWhile } from 'rxjs/operators';
import { TrackingFaction } from '../tracking-faction.service';

@Component({
    templateUrl: 'missions.component.html',
    styleUrls: ['missions.component.scss'],
    selector: 'app-missions'
})
export class MissionsComponent implements OnInit, OnDestroy {

    missionsCompleted: OriginatedMission[];
    factionMissionsCompleted: OriginatedMission[];
    trackedFaction: string;

    private alive = true;

    constructor(
        private journalService: JournalService,
        private journalDB: DBService,
        private missionService: MissionService,
        private trackingFaction: TrackingFaction
    ) { }

    ngOnInit() {
        this.missionService.factionMissionsCompleted
            .pipe(takeWhile(() => this.alive))
            .subscribe(factionMissionsCompleted => this.factionMissionsCompleted = factionMissionsCompleted);

        this.missionService.missionsCompleted
            .pipe(takeWhile(() => this.alive))
            .subscribe(missionsCompleted => this.missionsCompleted = missionsCompleted);

        this.trackingFaction.faction
            .pipe(takeWhile(() => this.alive))
            .subscribe(trackedFaction => this.trackedFaction = trackedFaction);

    }

    ngOnDestroy() {
        this.alive = false;
    }
}