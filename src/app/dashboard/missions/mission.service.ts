import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { MissionCompleted, JournalEvents, MissionAccepted, JournalEvent } from "cmdr-journal/dist";
import { JournalService } from "../../journal/journal.service";
import { OriginatedMission } from "./originatedMission";
import { DBService } from "../../core/services/db.service";
import { Observable, of, BehaviorSubject } from "rxjs";
import { takeWhile } from "rxjs/operators";
import { TrackingFaction } from "../tracking-faction.service";

@Injectable()
export class MissionService {

    private _missionsCompleted: OriginatedMission[];
    private missionsCompletedSubject: BehaviorSubject<OriginatedMission[]>;

    private _factionMissionsCompleted: OriginatedMission[] = [];
    private factionMissionsCompletedSubject: BehaviorSubject<OriginatedMission[]>;

    private cmdrName: string;
    private trackedFaction: string;

    get missionsCompleted() {
        return this.missionsCompletedSubject.asObservable();
    }

    get factionMissionsCompleted() {
        return this.factionMissionsCompletedSubject.asObservable();
    }

    private alive: boolean;

    constructor(
        private http: HttpClient,
        private journalService: JournalService,
        private journalDB: DBService,
        private trackingFaction: TrackingFaction
    ) {
        this._missionsCompleted = [];
        this._factionMissionsCompleted = [];
        this.missionsCompletedSubject = new BehaviorSubject(this._missionsCompleted);
        this.factionMissionsCompletedSubject = new BehaviorSubject(this._factionMissionsCompleted);

        this.cmdrName = "Unknown CMDR";
        this.alive = true;

        this.journalService.cmdrName
            .pipe(takeWhile(() => this.alive))
            .subscribe(cmdrName => this.cmdrName = cmdrName);

        this.watchMissions();

        this.trackingFaction.faction.subscribe(faction => {
            this.trackedFaction = faction;
            this.filterMissions();
            this.factionMissionsCompletedSubject.next(this._factionMissionsCompleted.slice(0));
        });

    }

    private async watchMissions() {
        this.journalService.on(JournalEvents.missionCompleted, async (data: JournalEvent) => {

            let completedMission = Object.assign(new MissionCompleted(), data);
            let originalMission: MissionAccepted = await this.journalDB.getEntry<MissionAccepted>(JournalEvents.missionAccepted, completedMission.MissionID);

            if (!originalMission) { return }
            let originatedMission: OriginatedMission = Object.assign({ originator: originalMission.Faction, LocalisedName: originalMission.LocalisedName }, completedMission)

            this._missionsCompleted.push(originatedMission);

            if (originatedMission.originator.toLowerCase() === this.trackedFaction.toLowerCase()) {
                this._factionMissionsCompleted.push(originatedMission);
                this.factionMissionsCompletedSubject.next(this._factionMissionsCompleted.slice(0));
            }

            this.missionsCompletedSubject.next(this._missionsCompleted.slice(0));

            this.completedMissionAlert(originatedMission, this.cmdrName).subscribe();
        })
    }


    private completedMissionAlert(missionCompleted: MissionCompleted, cmdrName: string) {
        cmdrName = encodeURIComponent(cmdrName);
        return this.http.post(`${process.env.API_ENDPOINT}/missions/completed/${cmdrName}`, { missionCompleted })
    }

    filterMissions() {
        this._factionMissionsCompleted = this._missionsCompleted
            .filter((mission: OriginatedMission) => {
                return mission.originator.toLowerCase() === this.trackedFaction.toLowerCase();
            })
    }

    ngOnDestroy() {
        this.alive = false;
    }
}