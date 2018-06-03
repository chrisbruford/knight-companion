import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { MissionCompleted, JournalEvents, MissionAccepted, JournalEvent } from "cmdr-journal/dist";
import { JournalService } from "../../journal/journal.service";
import { OriginatedMission } from "./originatedMission";
import { JournalDBService } from "../../journal/db/journal-db.service";
import { Observable, of, BehaviorSubject } from "rxjs";
import { takeWhile } from "rxjs/operators";

@Injectable()
export class MissionService {

    private _missionsCompleted: OriginatedMission[];
    private missionsCompletedSubject: BehaviorSubject<OriginatedMission[]>;
    private cmdrName: string;
    
    public missionsCompleted: Observable<OriginatedMission[]>;

    private alive: boolean;

    constructor(
        private http: HttpClient,
        private journalService: JournalService,
        private journalDB: JournalDBService
    ) {
        this._missionsCompleted = [];
        this.missionsCompletedSubject = new BehaviorSubject(this._missionsCompleted);
        this.missionsCompleted = this.missionsCompletedSubject.asObservable();
        this.cmdrName = "Unknown CMDR";
        this.alive = true;
        
        this.journalService.cmdrName
        .pipe(
            takeWhile(()=>this.alive)
        )
        .subscribe(cmdrName=>this.cmdrName = cmdrName);
        this.watchMissions();
    }

    private completedMission(missionCompleted: MissionCompleted, cmdrName: string) {
        cmdrName = encodeURIComponent(cmdrName);
        return this.http.post(`${process.env.API_ENDPOINT}/missions/completed/${cmdrName}`,{missionCompleted})
    }

    private async watchMissions() {
        this.journalService.on(JournalEvents.missionCompleted, async (data: JournalEvent) => {

            let completedMission = Object.assign(new MissionCompleted(), data);
            let originalMission: MissionAccepted = await this.journalDB.getEntry<MissionAccepted>(JournalEvents.missionAccepted, completedMission.MissionID);

            if (!originalMission) { return }
            let originatedMission: OriginatedMission = Object.assign({ originator: originalMission.Faction, LocalisedName: originalMission.LocalisedName }, completedMission)
            
            this._missionsCompleted.push(originatedMission);
            
            //fastest way to emit clone - not a deep clone
            this.missionsCompletedSubject.next(this._missionsCompleted.slice(0));
            
            this.completedMission(originatedMission, this.cmdrName).subscribe();
        })
    }

    ngOnDestroy() {
        this.alive = false;
    }
}