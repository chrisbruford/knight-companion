import { Component, NgZone } from "@angular/core";
import { ShipsService } from "./ships.service";
import { Loadout } from "cmdr-journal/dist";
import { takeWhile } from "rxjs/operators";
import { shell, clipboard } from 'electron';
import * as zlib from 'zlib';
import { MatSnackBar } from '@angular/material';
import cmdrJournal from 'cmdr-journal';

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
        let loadout = JSON.stringify(ship);

        zlib.gzip(loadout, (err, result) => {
            shell.openExternal(`https://coriolis.edcd.io/import?data=${result.toString("base64")}`);
        });
    }

    copyCoriolisURL(ship: Loadout): void {
        let loadout = JSON.stringify(ship);
        zlib.gzip(loadout, (err, result) => {
            clipboard.writeText(`https://coriolis.edcd.io/import?data=${result.toString("base64")}`);
            this.zone.run(() => {
                this.snackBar.open("Link copied to clipboard", "Dismiss", {
                    duration: 2000
                })
            });
        });
    }

    ngOnInit() {
        this.shipsService.getShips().pipe(
            takeWhile(() => this.alive)
        ).subscribe(ships => {
            let knownShips = Array.from(ships.values());
            knownShips.forEach(loadout=>{
                loadout.Modules.forEach(module=>{
                    let moduleDetails = cmdrJournal.OUTFITTING_MAP.get(module.Item.toLocaleLowerCase());
                    module["Item_KokLocalised"] = moduleDetails ? moduleDetails.name : undefined;
                })
            })
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