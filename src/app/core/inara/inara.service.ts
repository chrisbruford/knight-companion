import { Injectable, OnDestroy } from "@angular/core";
import { InaraEvent } from "./models/inara-event.model";
import { HttpClient } from "@angular/common/http";
import { retryWhen, delay, take, tap, map, flatMap, takeWhile, filter } from "rxjs/operators";
import { InaraResponse } from "./models/inara-response.model";
import { Observable, throwError, combineLatest, Observer } from "rxjs";
import { Submission } from "./models/submission.model";
import { remote } from "electron";
import { AppSetting } from "../enums/app-settings.enum";
import { JournalService } from "../../journal/journal.service";
import { JournalEvents, Statistics } from "cmdr-journal/dist";
import { SettingsService } from "../../dashboard/settings/settings.service";
import { AppErrorService } from "../services/app-error.service";
import { AppErrorTitle } from "../error-bar/app-error-title.enum";
import { InaraError } from "./inara-error";
import { InaraErrorCode } from "./inara-error-code";
import { SetCommanderGameStatisticsEvent } from "./models/set-commander-game-statistics-event.model";


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

        //BATCH SEND TO INARA
        this.journal.on(JournalEvents.fsdJump, () => this.sendToInara());
        this.journal.on(JournalEvents.undocked, () => this.sendToInara());
        this.journal.on(JournalEvents.resurrect, () => this.sendToInara());
        this.journal.on("Shutdown", () => this.sendToInara());
    }

    addEvent(event: InaraEvent) {
        this._events.push(event);
    }

    submitEvents(): Observable<InaraResponse> {
        if (!this._events || this._events.length === 0) { return throwError(new InaraError("There are no events to send", InaraErrorCode.NoEvents)) }

        if (this.allowInara) {
            return combineLatest(
                this.journal.cmdrName,
                this.settingsService.getSetting<{ setting: AppSetting, value: string }>(AppSetting.inaraAPIKey)
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
                        if (res.header.eventStatus !== 200) {
                            //offset subsequent removals by -n each time an element is removed
                            let n = 0;
                            if (res.events) {
                                for (let [i, event] of res.events.entries()) {
                                    if (event.eventStatus !== 400) { continue }
                                    else {
                                        this._events.splice(i - n++, 1);
                                    }
                                }
                            }
                            throw res
                        } else {
                            this._events = [];
                            return res
                        }
                    })
                )
        } else {
            return throwError(new InaraError("Inara broadcasts not allowed", InaraErrorCode.UserDeniedPermission))
        }
    }

    private sendToInara(): void {
        this.submitEvents()
            .pipe(take(1))
            .subscribe(
                res => {
                    this.appError.removeError(AppErrorTitle.inaraError);
                },
                err => {
                    if (!(err instanceof InaraError)) {
                        this.appError.addError(AppErrorTitle.inaraError, new Error("Failed to submit data to Inara"));
                    } else {
                        //TODO any handling required for specific InaraError
                    }
                }
            );
    }

    ngOnDestroy() {
        this.alive = false;
    }
}