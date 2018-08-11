import { Injectable } from "@angular/core";
import { MissionCompleted, JournalEvents, MissionAccepted, JournalEvent, Docked, MissionAbandoned, MissionFailed } from "cmdr-journal/dist";
import { JournalService } from "../../journal/journal.service";
import { OriginatedMission } from "./originatedMission";
import { DBService } from "../../core/services/db.service";
import { BehaviorSubject, combineLatest, fromEvent } from "rxjs";
import { takeWhile, withLatestFrom, tap } from "rxjs/operators";
import { TrackingFaction } from "../tracking-faction.service";
import { BroadcastService } from "../../core/services/broadcast.service";
import { InaraService } from "../../core/inara/inara.service";
import { AddCommanderMissionEvent } from "../../core/inara/add-commander-mission-event.model";
import { SetCommanderMissionAbandonedEvent } from "../../core/inara/set-commander-mission-abandoned-event.model";
import { SetCommanderMissionFailedEvent } from "../../core/inara/set-commander-mission-failed-event.model";
import { SetCommanderMissionCompletedEvent } from "../../core/inara/set-commander-mission-completed-event.model";

@Injectable({
    providedIn: 'root'
})
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
        private journalService: JournalService,
        private journalDB: DBService,
        private trackingFaction: TrackingFaction,
        private broadcastService: BroadcastService,
        private inara: InaraService
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

            //send to INARA
            
            let completedMission = Object.assign(new MissionCompleted(), data);
            const setCommanderMissionCompletedEvent = new SetCommanderMissionCompletedEvent(completedMission);
            this.inara.addEvent(setCommanderMissionCompletedEvent);

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
        });

        //send missions to inara
        fromEvent<MissionAccepted>(this.journalService, JournalEvents.missionAccepted)
            .pipe(
                withLatestFrom(
                    this.journalService.currentSystem,
                    this.journalService.currentStation,
                ),
                takeWhile(() => this.alive)
            )
            .subscribe(([missionAccepted, currentSystem, currentStation]) => {
                const addCommanderMissionEvent = new AddCommanderMissionEvent(missionAccepted, currentSystem, currentStation);
                this.inara.addEvent(addCommanderMissionEvent);
            });

        fromEvent<MissionAbandoned>(this.journalService, JournalEvents.missionAbandoned)
            .pipe(takeWhile(() => this.alive))
            .subscribe(missionAbandoned => {
                const setCommanderMissionAbandonedEvent = new SetCommanderMissionAbandonedEvent(missionAbandoned);
                this.inara.addEvent(setCommanderMissionAbandonedEvent);
            });

            fromEvent<MissionFailed>(this.journalService, JournalEvents.missionFailed)
            .pipe(takeWhile(() => this.alive))
            .subscribe(missionFailed => {
                const setCommanderMissionFailedEvent = new SetCommanderMissionFailedEvent(missionFailed);
                this.inara.addEvent(setCommanderMissionFailedEvent);
            });
    }


    private completedMissionAlert(missionCompleted: MissionCompleted, cmdrName: string) {
        cmdrName = encodeURIComponent(cmdrName);
        return this.broadcastService.broadcast(`${process.env.API_ENDPOINT}/missions/completed/${cmdrName}`, { missionCompleted });
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