import { Component, Input } from '@angular/core';
import { JournalService } from '../../journal/journal.service';
import { JournalDBService } from '../../journal/db/journal-db.service';
import { JournalEvents, JournalEvent, MissionCompleted, MissionAccepted, MissionAbandoned, MissionFailed, LoadGame, NewCommander } from 'cmdr-journal';
import { Subscription } from 'rxjs';
import { OriginatedMission } from './originatedMission';
import { MissionService } from './mission.service';

@Component({
    templateUrl: 'missions.component.html',
    styleUrls: ['missions.component.scss'],
    selector: 'app-missions'
})
export class MissionsComponent {

    missionsCompleted: OriginatedMission[] = [];
    oldMissionsCompleted: OriginatedMission[] = [];
    factionMissionsCompleted: OriginatedMission[] = [];
    @Input() trackingFaction: string;
    oldTrackingFaction: string;
    cmdrName: string;

    constructor(
        private journalService: JournalService,
        private journalDB: JournalDBService,
        private missionService: MissionService
    ) { }

    ngOnInit() {
        this.watchMissions();
        this.journalService.cmdrName.subscribe(name=>this.cmdrName = name);
    }

    ngDoCheck() {
        if (this.missionsCompleted.length !== this.oldMissionsCompleted.length) {
            this.factionMissionsCompleted = this.filterMissions(this.missionsCompleted);
            this.oldMissionsCompleted = Array.from(this.missionsCompleted);
            console.dir(this.factionMissionsCompleted);
        }
    }

    ngOnChanges(changes: any) {
        if (this.trackingFaction !== this.oldTrackingFaction) {
            this.factionMissionsCompleted = this.filterMissions(this.missionsCompleted);
            this.oldTrackingFaction = this.trackingFaction;
        }
    }

    async watchMissions() {
        this.journalService.on(JournalEvents.missionCompleted, async (data: JournalEvent) => {

            let completedMission = Object.assign(new MissionCompleted(), data);
            let originalMission: MissionAccepted = await this.journalDB.getEntry(JournalEvents.missionAccepted, completedMission.MissionID);

            if (!originalMission) { return }
            let originatedMission: OriginatedMission = Object.assign({ originator: originalMission.Faction, LocalisedName: originalMission.LocalisedName }, completedMission)
            this.missionsCompleted.push(originatedMission);
            this.missionService.completedMission(originatedMission, this.cmdrName).subscribe();
        })
    }

    filterMissions(allMissions: OriginatedMission[]): OriginatedMission[] {
        return allMissions.filter((mission: OriginatedMission) => {
            return mission.originator.toLowerCase() === this.trackingFaction.toLowerCase();
        })
    }
}