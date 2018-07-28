import { Injectable } from "../../../../node_modules/@angular/core";
import { DBService } from "../../core/services/db.service";
import { DBStore } from "../../core/enums/db-stores.enum";

@Injectable({
    providedIn: 'root'
}) export class SettingsService {
    constructor(
        private dbService: DBService
    ){}

    updateSetting(setting: string, value: any): Promise<boolean> {
        return this.dbService.putEntry(DBStore.appSettings,{key: setting, value})
    }

    getSetting<T>(setting: string): Promise<T> {
        return this.dbService.getEntry<T>(DBStore.appSettings, setting);
    }
}