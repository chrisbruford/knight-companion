import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { JournalService } from '../../journal/journal.service';
import { JournalDBService } from '../../journal/db/journal-db.service';
import { JournalEvents, JournalEvent, MissionCompleted, MissionAccepted, MissionAbandoned, MissionFailed, LoadGame, NewCommander } from 'cmdr-journal';
import { Subscription } from 'rxjs';
import { OriginatedMission } from './originatedMission';
import { MissionService } from './mission.service';
import { takeWhile } from 'rxjs/operators';

@Component({
    templateUrl: 'missions.component.html',
    styleUrls: ['missions.component.scss'],
    selector: 'app-missions'
})
export class MissionsComponent implements OnInit, OnDestroy {

    missionsCompleted: OriginatedMission[] = [];
    oldMissionsCompleted: OriginatedMission[] = [];
    factionMissionsCompleted: OriginatedMission[] = [];
    @Input() trackingFaction: string;
    oldTrackingFaction: string;
    
    private alive = true;

    constructor(
        private journalService: JournalService,
        private journalDB: JournalDBService,
        private missionService: MissionService
    ) { }

    ngOnInit() {
        this.missionService.missionsCompleted.pipe(
            takeWhile(()=>this.alive)
        ).subscribe((completedMissions: OriginatedMission[])=>{
            this.missionsCompleted = completedMissions;
        });
    }

    ngDoCheck() {
        if (this.missionsCompleted.length !== this.oldMissionsCompleted.length) {
            this.factionMissionsCompleted = this.filterMissions(this.missionsCompleted);
            this.oldMissionsCompleted = Array.from(this.missionsCompleted);
        }
    }

    ngOnChanges(changes: any) {
        if (this.trackingFaction !== this.oldTrackingFaction) {
            this.factionMissionsCompleted = this.filterMissions(this.missionsCompleted);
            this.oldTrackingFaction = this.trackingFaction;
        }
    }

    ngOnDestroy() {
        this.alive = false;
    }

    filterMissions(allMissions: OriginatedMission[]): OriginatedMission[] {
        return allMissions.filter((mission: OriginatedMission) => {
            return mission.originator.toLowerCase() === this.trackingFaction.toLowerCase();
        })
    }
}