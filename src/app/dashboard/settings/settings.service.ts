import { Injectable } from "@angular/core";
import { DBService } from "../../core/services/db.service";
import { DBStore } from "../../core/enums/db-stores.enum";
import { AppSetting } from "../../core/enums/app-settings.enum";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
}) export class SettingsService {
    private setting$ = new Subject<{ setting: AppSetting, value: any }>();
    get settings() {
        return this.setting$.asObservable();
    }

    private _settings = new Map<AppSetting, any>();

    constructor(
        private dbService: DBService
    ) { }

    updateSetting(setting: AppSetting, value: any): Promise<boolean> {
        return this.dbService.putEntry(DBStore.appSettings, { key: setting, value })
            .then(
                result => {
                    if (result) {
                        this._settings.set(setting, value);
                        this.setting$.next({
                            setting,
                            value
                        })
                    }
                    return result
                }
            )
    }

    getSetting<T>(setting: AppSetting): Promise<T> {
        const _setting: T = this._settings.get(setting);
        if (_setting !== undefined) {
            return Promise.resolve(_setting);
        } else {
            return this.dbService.getEntry<T>(DBStore.appSettings, setting)
                .then(_setting => {
                    this._settings.set(setting, _setting);
                    return _setting
                });
        }
    }
}