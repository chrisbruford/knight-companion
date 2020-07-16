import { Injectable } from "@angular/core";
import { SettingsService } from "../../dashboard/settings/settings.service";
import { Observable, throwError } from "rxjs";
import { AppSetting } from "../enums/app-settings.enum";
import { HttpClient } from "@angular/common/http";
import { filter } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class BroadcastService {
  allowBroadcasts: boolean;

  constructor(
    public settingService: SettingsService,
    private http: HttpClient
  ) {
    settingService
      .getSetting<{ key: string; value: any }>(AppSetting.broadcasts)
      .then(
        (setting) => (this.allowBroadcasts = setting ? setting.value : true)
      );

    settingService.settings
      .pipe(filter((setting) => setting.setting === AppSetting.broadcasts))
      .subscribe((setting) => (this.allowBroadcasts = setting.value));
  }

  broadcast<T>(url: string, message: any): Observable<T> {
    if (this.allowBroadcasts || this.allowBroadcasts === undefined) {
      return this.http.post<T>(url, message);
    } else {
      return throwError(new Error("Broadcasts not enabled"));
    }
  }
}
