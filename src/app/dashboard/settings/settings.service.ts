import { Injectable } from "@angular/core";
import { DBService } from "../../core/services/db.service";
import { DBStore } from "../../core/enums/db-stores.enum";
import { AppSetting } from "../../core/enums/app-settings.enum";
import { Observable, BehaviorSubject } from "../../../../node_modules/rxjs";

@Injectable({
    providedIn: 'root'
}) export class SettingsService {

    constructor(
        private dbService: DBService
    ) { }

    updateSetting(setting: AppSetting, value: any): Promise<boolean> {
        return this.dbService.putEntry(DBStore.appSettings, { key: setting, value })
    }

    getSetting<T>(setting: AppSetting): Promise<T> {
        return this.dbService.getEntry<T>(DBStore.appSettings, setting);
    }
}