import { ShipsService } from "./ships.service";
import { JournalService } from "../../journal/journal.service";
import { DBService } from "../../core/services/db.service";
import { NgZone, EventEmitter } from "../../../../node_modules/@angular/core";
import { HttpClient } from "../../../../node_modules/@angular/common/http";
import { InaraService } from "../../core/inara/inara.service";


describe('ShipService',()=>{
    let shipsService: ShipsService;
    let jounrnalService: JournalService;
    let dbService: DBService;
    let zone: NgZone;
    let http: HttpClient;
    let inara: InaraService;

    beforeEach(()=>{
        let fakeJournalService = new EventEmitter();
        inara = jasmine.createSpyObj('Inara',['addEvent']);
        shipsService = new ShipsService(jounrnalService, dbService, zone, http, inara);
    })

    it('should add a AddCommanderShip event to the inara service when a loadout event occurs',()=>{
        
    })

});