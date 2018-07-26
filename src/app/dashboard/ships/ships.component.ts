import { Component, NgZone } from "@angular/core";
import { ShipsService } from "./ships.service";
import { Loadout } from "cmdr-journal/dist";
import { takeWhile, catchError } from "rxjs/operators";
import { shell, clipboard } from 'electron';
import * as zlib from 'zlib';
import { MatSnackBar } from '@angular/material';
import cmdrJournal from 'cmdr-journal';
import { Subject, Observable } from "../../../../node_modules/rxjs";

@Component({
    selector: "app-ships",
    templateUrl: "./ships.component.html",
    styleUrls: ["./ships.component.scss"]
}) export class ShipsComponent {

    private ships: Loadout[];
    private alive = true;
    private columnsToDisplay = ['slot', 'item'];

    constructor(
        private shipsService: ShipsService,
        private snackBar: MatSnackBar,
        private zone: NgZone
    ) { }

    openCoriolis(ship: Loadout): void {
        this.getCoriolisURL(ship).subscribe(url => {
            shell.openExternal(url);
        });
    }

    copyCoriolisURL(ship: Loadout): void {
        this.getCoriolisURL(ship)
            .subscribe((url) => {
                this.zone.run(() => {
                    clipboard.writeText(url);
                    this.snackBar.open("Link copied to clipboard", "DISMISS", {
                        duration: 2000
                    });
                });
            }, (err) => { console.error(err) });
    }

    private getCoriolisURL(ship: Loadout): Observable<string> {
        let urlObs = new Subject<string>();
        let loadout = JSON.stringify(ship);

        zlib.gzip(loadout, (err, result) => {
            if (err) { urlObs.error(new Error('gzip error')) }
            this.shipsService.getOrbisShortUrl(`https://coriolis.edcd.io/import?data=${result.toString("base64")}`, 'json')
                .subscribe(url => {
                    urlObs.next(url);
                })
        })

        return urlObs.asObservable();
    }

    ngOnInit() {
        this.shipsService.getShips().pipe(
            takeWhile(() => this.alive)
        ).subscribe(ships => {
            let knownShips = Array.from(ships.values());
            knownShips.forEach(loadout => {
                loadout.Modules.forEach(module => {
                    let moduleDetails = cmdrJournal.OUTFITTING_MAP.get(module.Item.toLocaleLowerCase());
                    module["Item_KokLocalised"] = moduleDetails ? moduleDetails.name : undefined;
                })
            });
            this.ships = knownShips;
        });
    }

    trackShipsBy(index: number, ship: Loadout) {
        return ship.ShipID;
    }

    ngOnDestroy() {
        this.alive = false;
    }

}