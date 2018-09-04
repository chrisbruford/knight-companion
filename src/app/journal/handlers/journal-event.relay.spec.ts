import { JournalEventRelay } from "./journal-event.relay";
import { TestBed } from "@angular/core/testing";
import { JournalService } from "../journal.service";
import { EventEmitter } from "events";
import { JournalEvents, Statistics } from "cmdr-journal/dist";
import { InaraService } from "../../core/inara/inara.service";

describe('JournalEventRelay', () => {

    const fakeJournalService = new EventEmitter();
    const fakeInaraService: jasmine.SpyObj<InaraService> = jasmine.createSpyObj('InaraService', ['addEvent']);
    let journalEventRelay: JournalEventRelay;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: JournalService, useValue: fakeJournalService },
                { provide: InaraService, useValue: fakeInaraService },
                JournalEventRelay
            ]
        });

        journalEventRelay = TestBed.get(JournalEventRelay);
    })

    it('should exist', () => {
        expect(journalEventRelay).toBeDefined();
    });

    it('should send data events from the JournalService to the InaraService', () => {
        const journalService: EventEmitter = TestBed.get(JournalService);
        const inaraService: jasmine.SpyObj<InaraService> = TestBed.get(InaraService);
        let statistics = new Statistics();
        statistics.Bank_Account = {
            Current_Wealth: 1000000,
            Insurance_Claims: 0,
            Spent_On_Ammo_Consumables: 1000,
            Spent_On_Fuel: 1000,
            Spent_On_Insurance: 1000,
            Spent_On_Outfitting: 1000,
            Spent_On_Repairs: 10000,
            Spent_On_Ships: 1000
        }
        journalService.emit(JournalEvents.statistics, statistics);

        expect(inaraService.addEvent).toHaveBeenCalledWith(jasmine.objectContaining({ 
            eventData: jasmine.objectContaining({ 
                Bank_Account: jasmine.objectContaining(statistics.Bank_Account) 
            }) 
        }));
    });
});