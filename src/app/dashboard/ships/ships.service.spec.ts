import { ShipsService } from "./ships.service";
import { JournalService } from "../../journal/journal.service";
import { DBService } from "../../core/services/db.service";
import { NgZone } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { InaraService } from "../../core/inara/inara.service";
import { FakeJournalService } from "../../journal/journal.service.mock";
import { LoggerService, RE } from "../../core/services";
import { JournalQueueService } from "../../journal/journalQueue.service";
import { EDDNService } from "../../journal/eddn.service";
import { TestBed, async } from "@angular/core/testing";
import { AppErrorService } from "../../core/services/app-error.service";
import { AppError } from "../../core/error-bar/app-error.model";
import { EventEmitter } from 'events';
import { Loadout, JournalEvents, ShipyardSell } from "cmdr-journal/dist";
import { SetCommanderShipEvent } from "../../core/inara/models/set-commander-ship-event.model";
import { SetCommanderShipLoadout } from "../../core/inara/models/set-commander-ship-loadout.model";


describe('ShipService', () => {
    let shipsService: ShipsService;
    let dbService: jasmine.SpyObj<DBService>;
    let http: HttpClient;
    let logger: LoggerService;
    let appErrorService: jasmine.SpyObj<AppErrorService>;
    let fakeInaraService: InaraService;
    let fakeJournalService: EventEmitter;

    beforeEach(() => {
        appErrorService = jasmine.createSpyObj('AppErrorService', ['removeError', 'addError']);
        appErrorService.addError.and.callFake((title: string, error: AppError) => {
            let errors = new Map();
            errors.set(title, error);
            return errors;
        });
        http = {} as HttpClient;
        logger = {} as LoggerService;
        fakeInaraService = jasmine.createSpyObj('Inara', ['addEvent']);
        dbService = jasmine.createSpyObj('DBService', ['getAll']);
        dbService.getAll.and.callFake((store: string) => Promise.resolve(['things']));
        fakeJournalService = new EventEmitter();


        TestBed.configureTestingModule({
            providers: [
                { provide: JournalService, useValue: fakeJournalService },
                { provide: LoggerService, useValue: logger },
                { provide: AppErrorService, useValue: appErrorService },
                { provide: DBService, useValue: dbService },
                { provide: HttpClient, useValue: http },
                { provide: InaraService, useValue: fakeInaraService },
                ShipsService
            ]
        });
        shipsService = TestBed.get(ShipsService);
    });

    it('should add a setCommanderShip event to the inara service when a loadout event occurs', () => {
        let inaraService: InaraService = TestBed.get(InaraService);
        let loadout = new Loadout();
        loadout.Ship = "Python";
        loadout.ShipID = 123456789;
        loadout.timestamp = new Date().toUTCString();
        fakeJournalService.emit(JournalEvents.loadout, loadout);
        expect(inaraService.addEvent).toHaveBeenCalledWith(jasmine.objectContaining(new SetCommanderShipEvent(loadout)));
    });

    it('should add a setCommanderShipLoadout event when a loadout event occurs',()=>{
        let inaraService: InaraService = TestBed.get(InaraService);
        let loadout = new Loadout();
        loadout.Ship = "Python";
        loadout.ShipID = 123456789;
        loadout.timestamp = new Date().toUTCString();
        fakeJournalService.emit(JournalEvents.loadout, loadout);
        expect(inaraService.addEvent).toHaveBeenCalledWith(jasmine.objectContaining(new SetCommanderShipLoadout(loadout)));
    });

    it('should add a delCommanderShip event to the inara service when a ship is sold or not rebought', () => {
        let inaraService = TestBed.get(InaraService) as jasmine.SpyObj<InaraService>;
        let loadout = new Loadout();
        loadout.ShipID = 123456789;
        loadout.Ship = 'Python';
        fakeJournalService.emit('notRebought', loadout);
        expect(inaraService.addEvent).toHaveBeenCalledWith(jasmine.objectContaining({
            eventTimestamp: jasmine.any(String),
            eventName: 'delCommanderShip',
            eventData: jasmine.objectContaining({
                shipGameID: loadout.ShipID,
                shipType: loadout.Ship
            })
        }));

        inaraService.addEvent.calls.reset();

        let shipyardSell = new ShipyardSell();
        shipyardSell.SellShipID = 123456789;
        shipyardSell.ShipType = 'Python';

        fakeJournalService.emit(JournalEvents.shipyardSell, shipyardSell);
        expect(inaraService.addEvent).toHaveBeenCalledWith(jasmine.objectContaining({
            eventTimestamp: jasmine.any(String),
            eventName: 'delCommanderShip',
            eventData: jasmine.objectContaining({
                shipGameID: loadout.ShipID,
                shipType: loadout.Ship
            })
        }));
    });
});