import { Injectable } from "@angular/core";
import { InaraEvent } from "./models/inara-event.model";
import { HttpClient, HttpErrorResponse } from "../../../../node_modules/@angular/common/http";
import { catchError, retryWhen, delay, take, tap, map, flatMap } from "../../../../node_modules/rxjs/operators";
import { InaraResponse } from "./models/inara-response.model";
import { Observable, throwError, combineLatest } from "../../../../node_modules/rxjs";
import { DBService } from "../services/db.service";
import { Submission } from "./models/submission.model";
import { remote } from "electron";
import { DBStore } from "../enums/db-stores.enum";
import { AppSetting } from "../enums/app-settings.enum";
import { JournalService } from "../../journal/journal.service";
import { JournalEvents } from "../../../../node_modules/cmdr-journal/dist";


@Injectable({
    providedIn: 'root'
}) export class InaraService {
    private _events: InaraEvent[] = [];

    getEvents() {
        return [...this._events];
    }

    constructor(private http: HttpClient, private db: DBService, private journal: JournalService) { 
        this.journal.on(JournalEvents.fsdJump, this.submitEvents);
        this.journal.on(JournalEvents.undocked, this.submitEvents);
        this.journal.on(JournalEvents.resurrect, this.submitEvents);
    }

    addEvent(event: InaraEvent) {
        this._events.push(event);
    }

    submitEvents(): Observable<InaraResponse> {

        return combineLatest(this.journal.cmdrName, this.db.getEntry<string>(DBStore.appSettings, AppSetting.inaraAPIKey))
            .pipe(
                flatMap(([cmdrName, inaraAPIKey]) => {
                    const submission: Submission = {
                        header: {
                            appName: 'knights-companion',
                            appVersion: remote.app.getVersion(),
                            APIkey: inaraAPIKey,
                            commanderName: cmdrName,
                            isDeveloped: true
                        },
                        events: this._events
                    }

                    return this.http.post<InaraResponse>(process.env.INARA_API_ENDPOINT, submission)
                }),
                retryWhen(err => {
                    return err.pipe(
                        tap(err=>console.log(err.message)),
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
    }
}