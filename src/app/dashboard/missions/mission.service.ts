import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { MissionCompleted } from "cmdr-journal/dist";
import { AppSettingsService } from "../../core/app-settings.service";

@Injectable()
class MissionService {
    constructor(
        private http: HttpClient,
        private appSettings: AppSettingsService,
    ) {}

    completedMission(missionCompleted: MissionCompleted) {
        this.http.post(`${AppSettingsService.API_ENDPOINT}/missions/completed`,missionCompleted);
    }
}