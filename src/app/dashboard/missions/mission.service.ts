import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { MissionCompleted } from "cmdr-journal/dist";
import { AppSettingsService } from "../../core/app-settings.service";

@Injectable()
export class MissionService {
    constructor(
        private http: HttpClient,
        private appSettings: AppSettingsService,
    ) {}

    completedMission(missionCompleted: MissionCompleted, cmdrName: string) {
        cmdrName = encodeURIComponent(cmdrName);
        
        console.log(`${AppSettingsService.API_ENDPOINT}/missions/completed/${cmdrName}`,{missionCompleted})
        this.http.post(`${AppSettingsService.API_ENDPOINT}/missions/completed/${cmdrName}`,{missionCompleted});
    }
}