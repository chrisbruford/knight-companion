import { Injectable, NgZone } from "@angular/core";
import { Observable } from 'rxjs';
import { of, BehaviorSubject } from 'rxjs';
import { JournalService } from "../../journal/journal.service";
import { JournalEvents, Loadout, Resurrect, ShipyardSell } from "cmdr-journal/dist";
import { JournalDBService } from "../../journal/db/journal-db.service";

@Injectable()
export class ShipsService {

    private ships = new Map<number,Loadout>();
    private shipsObservable = new BehaviorSubject<Map<number,Loadout>>(this.ships);

    constructor(
        private journalService: JournalService,
        private journalDBService: JournalDBService,
        private zone: NgZone
    ) {

        this.journalDBService.getAll<Loadout>('ships')
            .then(loadouts=>{
                loadouts.forEach(loadout=>{
                    this.ships.set(loadout.ShipID,loadout);
                });
                zone.run(()=>this.shipsObservable.next(this.ships));
            })
            .catch(console.log);
        
        journalService.on(JournalEvents.loadout,(loadout: Loadout)=>{
           this.ships.set(loadout.ShipID, loadout);
            zone.run(()=>this.shipsObservable.next(this.ships));
        });

        journalService.on("notRebought",(shipID: number)=>{
            this.ships.delete(shipID);
            zone.run(()=>this.shipsObservable.next(this.ships));
        });

        journalService.on(JournalEvents.shipyardSell,(shipyardSell: ShipyardSell)=>{
            this.ships.delete(shipyardSell.SellShipID);
            zone.run(()=>this.shipsObservable.next(this.ships));
        });
    }

    getShips(): Observable<Map<number,Loadout>> {
        return this.shipsObservable.asObservable();
    }


}