import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { MissionCompleted } from "cmdr-journal/dist";

@Injectable()
export class MissionService {
    constructor(
        private http: HttpClient
    ) {}

    completedMission(missionCompleted: MissionCompleted, cmdrName: string) {
        cmdrName = encodeURIComponent(cmdrName);
        return this.http.post(`${process.env.API_ENDPOINT}/missions/completed/${cmdrName}`,{missionCompleted})
    }
}