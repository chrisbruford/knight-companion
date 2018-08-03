import { Injectable } from '@angular/core';
import { SettingsService } from '../../dashboard/settings/settings.service';
import { Observable, throwError } from 'rxjs';
import { AppSetting } from '../enums/app-settings.enum';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
}) export class BroadcastService {
    allowBroadcasts: boolean;

    constructor(
        public settingService: SettingsService,
        private http: HttpClient
    ) {
        settingService.getSetting<boolean>(AppSetting.broadcasts)
            .then(allowed => this.allowBroadcasts = allowed);

        settingService.settings
            .pipe(filter(setting => setting.setting === AppSetting.broadcasts))
            .subscribe(setting => this.allowBroadcasts = setting.value);
    }

    broadcast<T>(url: string, message: any): Observable<T> {
        if (this.allowBroadcasts) {
            return this.http.post<T>(url, message);
        } else {
            return throwError(new Error("Broadcasts not enabled"));
        }
    }
}