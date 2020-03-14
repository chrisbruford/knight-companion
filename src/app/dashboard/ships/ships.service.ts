import { Injectable, NgZone } from "@angular/core";
import { Observable, throwError ,  of, BehaviorSubject } from 'rxjs';
import { JournalService } from "../../journal/journal.service";
import { JournalEvents, Loadout, Resurrect, ShipyardSell } from "cmdr-journal/dist";
import { DBService } from "../../core/services/db.service";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { map, retry, catchError } from "rxjs/operators";
import { OrbisUrl } from "./orbis-url.model";
import { InaraService } from "../../core/inara/inara.service";
import { AddCommanderShipEvent } from "../../core/inara/models/add-commander-ship-event.model";
import { DelCommanderShipEvent } from "../../core/inara/models/del-commander-ship-event.model";
import { SetCommanderShipLoadoutEvent } from "../../core/inara/models/set-commander-ship-loadout-event.model";
import { SetCommanderShipEvent } from "../../core/inara/models/set-commander-ship-event.model";

@Injectable({
    providedIn: 'root'
})
export class ShipsService {

    public ships = new Map<number, Loadout>();
    private shipsObservable = new BehaviorSubject<Map<number, Loadout>>(this.ships);

    constructor(
        private journalService: JournalService,
        private journalDBService: DBService,
        private zone: NgZone,
        private http: HttpClient,
        private inara: InaraService
    ) {

        this.journalDBService.getAll<Loadout>('ships')
            .then(loadouts => {
                loadouts.forEach(loadout => {
                    this.ships.set(loadout.ShipID, loadout);
                });
                zone.run(() => this.shipsObservable.next(this.ships));
            })
            .catch(console.log);

        journalService.on(JournalEvents.loadout, (loadout: Loadout) => {
            this.ships.set(loadout.ShipID, loadout);
            this.inara.addEvent(new SetCommanderShipEvent(loadout));
            this.inara.addEvent(new SetCommanderShipLoadoutEvent(loadout));
            zone.run(() => this.shipsObservable.next(this.ships));
        });

        journalService.on("notRebought", (ship: Loadout) => {
            let delCommanderShipEvent = new DelCommanderShipEvent(ship.Ship, ship.ShipID);
            this.ships.delete(ship.ShipID);
            this.inara.addEvent(delCommanderShipEvent);
            zone.run(() => this.shipsObservable.next(this.ships));
        });

        journalService.on(JournalEvents.shipyardSell, (shipyardSell: ShipyardSell) => {
            let delCommanderShipEvent = new DelCommanderShipEvent(shipyardSell.ShipType, shipyardSell.SellShipID);
            this.inara.addEvent(delCommanderShipEvent);
            this.ships.delete(shipyardSell.SellShipID);
            zone.run(() => this.shipsObservable.next(this.ships));
        });
    }

    getShips(): Observable<Map<number, Loadout>> {
        return this.shipsObservable.asObservable();
    }

    getOrbisShortUrl(lsturl: string, format: string): Observable<string> {

        const data = new FormData();
        data.append('url', lsturl);
        data.append('format', format);
        data.append('action', 'shorturl');

        return this.http.post<OrbisUrl>('https://s.orbis.zone/api.php', data)
            .pipe(
                retry(3),
                catchError((err) => this.handleError(err, false)),
                map(res => {
                    if (res && res.success) {
                        return res.shorturl
                    } else {
                        return lsturl
                    }
                })
            )
    }



    private handleError(error: HttpErrorResponse, rethrow = true) {
        if (error.error instanceof ErrorEvent) {
            console.error('An error occurred:', error.error.message);
        } else {
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${error.error}`);
        }
        if (rethrow) {
            return throwError(
                'Unable to complete request. Please try again later.');
        }
    };


}