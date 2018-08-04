import { Injectable, OnDestroy } from "@angular/core";
import { InaraEvent } from "./models/inara-event.model";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError, retryWhen, delay, take, tap, map, flatMap, takeWhile, filter } from "rxjs/operators";
import { InaraResponse } from "./models/inara-response.model";
import { Observable, throwError, combineLatest } from "rxjs";
import { DBService } from "../services/db.service";
import { Submission } from "./models/submission.model";
import { remote } from "electron";
import { DBStore } from "../enums/db-stores.enum";
import { AppSetting } from "../enums/app-settings.enum";
import { JournalService } from "../../journal/journal.service";
import { JournalEvents } from "cmdr-journal/dist";
import { SettingsService } from "../../dashboard/settings/settings.service";
import { AppErrorService } from "../services/app-error.service";
import { AppErrorTitle } from "../error-bar/app-error-title.enum";


@Injectable({
    providedIn: 'root'
}) export class InaraService implements OnDestroy {
    allowInara = false;
    alive = true;
    private _events: InaraEvent[] = [];

    getEvents() {
        return [...this._events];
    }

    constructor(
        private http: HttpClient,
        private journal: JournalService,
        private settingsService: SettingsService,
        private appError: AppErrorService
    ) {
        this.settingsService.getSetting<boolean>(AppSetting.inaraBroadcasts)
            .then(allow => this.allowInara = allow);

        this.settingsService.settings.pipe(
            takeWhile(() => this.alive),
            filter(setting => setting.setting === AppSetting.inaraBroadcasts)
        )
            .subscribe(setting => this.allowInara = setting.value);

        this.journal.on(JournalEvents.fsdJump, () => this.sendToInara());
        this.journal.on(JournalEvents.undocked, () => this.sendToInara());
        this.journal.on(JournalEvents.resurrect, () => this.sendToInara());
    }

    addEvent(event: InaraEvent) {
        this._events.push(event);
    }

    submitEvents(): Observable<InaraResponse> {
        if (this.allowInara) {
            return combineLatest(
                this.journal.cmdrName,
                this.settingsService.getSetting<{setting: AppSetting, value: string}>(AppSetting.inaraAPIKey)
            )
                .pipe(
                    flatMap(([cmdrName, inaraAPIKey]) => {
                        const submission: Submission = {
                            header: {
                                appName: 'knight-companion',
                                appVersion: remote.app.getVersion(),
                                APIkey: inaraAPIKey.value,
                                commanderName: cmdrName,
                                isDeveloped: true
                            },
                            events: this._events
                        }

                        return this.http.post<InaraResponse>(process.env.INARA_API_ENDPOINT, submission)
                    }),
                    retryWhen(err => {
                        return err.pipe(
                            tap(err => console.log(err.message)),
                            delay(10000),
                            take(3)
                        )
                    }),
                    map(res => {
                        this._events = [];
                        if (res.header.eventStatus !== 200) {
                            throw res
                        } else {
                            return res
                        }
                    })
                )
        } else {
            return throwError(new Error("Inara broadcasts not allowed"))
        }
    }

    sendToInara() {
        this.submitEvents().subscribe(
            res => {
                this.appError.removeError(AppErrorTitle.inaraError);
            },
            err => {
                let message = err.message === "Inara broadcasts not allowed" ? err.message : "Failed to submit data to Inara"
                this.appError.addError(AppErrorTitle.inaraError, message)
            }
        )
    }

    ngOnDestroy() {
        this.alive = false;
    }
}