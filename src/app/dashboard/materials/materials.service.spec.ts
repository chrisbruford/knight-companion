import { TestBed, fakeAsync } from "@angular/core/testing";
import { JournalService } from "../../journal/journal.service";
import { DBService } from "../../core/services/db.service";
import { MaterialsService } from "./materials.service";
import { EventEmitter } from "events";
import { KOKJournalEvents } from "../../journal/kok-journal-events.enum";
import { Material } from "./material.model";
import { InaraService } from "../../core/inara/inara.service";
import { SetCommanderMaterialsItemEvent } from "../../core/inara/models/set-commander-materials-item-event.model";
import { SetCommanderInventoryMaterialsEvent } from "../../core/inara/models/set-commander-inventory-materials-event.model";
import { JournalEvents } from "cmdr-journal/dist";

describe('MaterialsService',()=>{
    let journalService: jasmine.SpyObj<JournalService>;
    let dbService: jasmine.SpyObj<DBService>;
    let materialsService: MaterialsService;
    let inaraService: jasmine.SpyObj<InaraService>;

    beforeEach(()=>{
        let fakeInaraService: jasmine.SpyObj<InaraService> = jasmine.createSpyObj('InaraService',['addEvent']);
        let fakeJournalService = new EventEmitter();
        let fakeDBService: jasmine.SpyObj<DBService> = jasmine.createSpyObj('DBService',['getAll']);
        fakeDBService.getAll.and.callFake((store: string)=>{
            return Promise.resolve([]);
        })

        TestBed.configureTestingModule({
            providers: [
                {provide: JournalService, useValue: fakeJournalService},
                {provide: DBService, useValue: fakeDBService},
                {provide: InaraService, useValue: fakeInaraService},
                MaterialsService
            ]
        });

        journalService = TestBed.get(JournalService);
        dbService = TestBed.get(DBService);
        inaraService = TestBed.get(InaraService);
        materialsService = TestBed.get(MaterialsService);
    });

    it('should exist',()=>{
        expect(materialsService).toBeDefined();
    });

    describe("inara integration",()=>{
        it('should send individual material data to Inara',fakeAsync(()=>{
            let material = new Material()
            material.Name = 'Unobtanium';
            material.Count = 100;
            material.Category = "Raw";
            let expectedEvent = Object.assign(
                new SetCommanderMaterialsItemEvent({itemCount: material.Count, itemName: material.Name}),
                { eventTimestamp: jasmine.any(String) }
            );
            
            journalService.emit(KOKJournalEvents.materialUpdate, material);
            expect(inaraService.addEvent).toHaveBeenCalledWith(jasmine.objectContaining(expectedEvent));
        }));

        it('should send whole material updates to Inara',fakeAsync(()=>{
            let material = new Material()
            material.Name = 'Unobtanium';
            material.Count = 100;

            let materials = {
                Encoded: [material,material,material],
                Raw: [material,material,material],
                Manufactured: [material,material,material]
            };

            let expectedEvent = {
                eventTimestamp: jasmine.any(String),
                eventData: jasmine.arrayContaining([
                    jasmine.objectContaining({itemCount: 100, itemName: 'Unobtanium'}),
                    jasmine.objectContaining({itemCount: 100, itemName: 'Unobtanium'}),
                    jasmine.objectContaining({itemCount: 100, itemName: 'Unobtanium'}),
                    jasmine.objectContaining({itemCount: 100, itemName: 'Unobtanium'}),
                    jasmine.objectContaining({itemCount: 100, itemName: 'Unobtanium'}),
                    jasmine.objectContaining({itemCount: 100, itemName: 'Unobtanium'}),
                    jasmine.objectContaining({itemCount: 100, itemName: 'Unobtanium'}),
                    jasmine.objectContaining({itemCount: 100, itemName: 'Unobtanium'}),
                    jasmine.objectContaining({itemCount: 100, itemName: 'Unobtanium'})
                ])
            }
            
            journalService.emit(JournalEvents.materials, materials);
            expect(inaraService.addEvent).toHaveBeenCalledWith(jasmine.objectContaining(expectedEvent));
        }));
    });
});