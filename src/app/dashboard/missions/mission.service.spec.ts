import { JournalService } from "../../journal/journal.service";
import { DBService } from "../../core/services/db.service";
import { HttpClient } from "@angular/common/http";
import { InaraService } from "../../core/inara/inara.service";
import { LoggerService } from "../../core/services";
import { TestBed, async } from "@angular/core/testing";
import { AppErrorService } from "../../core/services/app-error.service";
import { AppError } from "../../core/error-bar/app-error.model";
import { EventEmitter } from 'events';
import { TrackingFaction } from "../tracking-faction.service";
import { of } from "../../../../node_modules/rxjs";
import { BroadcastService } from "../../core/services/broadcast.service";
import { MissionService } from "./mission.service";
import { JournalEvents, MissionAccepted, MissionAbandoned, MissionFailed, MissionCompleted } from "../../../../node_modules/cmdr-journal/dist";
import { AddCommanderMissionEvent } from "../../core/inara/add-commander-mission-event.model";
import { SetCommanderMissionAbandonedEvent } from "../../core/inara/set-commander-mission-abandoned-event.model";
import { SetCommanderMissionFailedEvent } from "../../core/inara/set-commander-mission-failed-event.model";
import { SetCommanderMissionCompletedEvent } from "../../core/inara/set-commander-mission-completed-event.model";


describe('MissionService', () => {
    let fakeDBService: jasmine.SpyObj<DBService>;
    let fakeHttpClient: HttpClient;
    let logger: LoggerService;
    let fakeAppErrorService: jasmine.SpyObj<AppErrorService>;
    let fakeInaraService: InaraService;
    let fakeJournalService: EventEmitter;
    let fakeBroadcastService: jasmine.SpyObj<BroadcastService> = jasmine.createSpyObj('BroadcastService', ['broadcast']);
    fakeBroadcastService.broadcast.and.callFake((url:string, obj:any)=>of(true))

    let fakeTrackingFaction = {
        faction: of('Knights of Karma')
    }
    let missionService: MissionService;

    beforeEach(() => {
        fakeAppErrorService = jasmine.createSpyObj('AppErrorService', ['removeError', 'addError']);
        fakeAppErrorService.addError.and.callFake((title: string, error: AppError) => {
            let errors = new Map();
            errors.set(title, error);
            return errors;
        });
        fakeHttpClient = {} as HttpClient;
        logger = {} as LoggerService;
        fakeInaraService = jasmine.createSpyObj('Inara', ['addEvent']);
        fakeDBService = jasmine.createSpyObj('DBService', ['getAll','getEntry']);
        fakeDBService.getAll.and.callFake((store: string) => Promise.resolve(['things']));
        fakeJournalService = Object.assign(new EventEmitter(), { cmdrName: of('Test CMDR'), currentSystem: of("Qa'wakana"), currentStation: of('Carpini Terminal') });


        TestBed.configureTestingModule({
            providers: [
                { provide: JournalService, useValue: fakeJournalService },
                { provide: AppErrorService, useValue: fakeAppErrorService },
                { provide: DBService, useValue: fakeDBService },
                { provide: HttpClient, useValue: fakeHttpClient },
                { provide: InaraService, useValue: fakeInaraService },
                { provide: TrackingFaction, useValue: fakeTrackingFaction },
                { provide: BroadcastService, useValue: fakeBroadcastService },
                MissionService
            ]
        });
        missionService = TestBed.get(MissionService);
    });

    it('should exist', () => {
        expect(missionService).toBeDefined();
    });

    it('should add a addCommanderMissionEvent to the inaraService when accepted', () => {
        let js: EventEmitter = TestBed.get(JournalService);
        let inara: jasmine.SpyObj<InaraService> = TestBed.get(InaraService);

        let missionAccepted = Object.assign(new MissionAccepted(), {
            Name: 'Test Mission',
            MissionID: 123456789,
            Expiry: new Date().toISOString(),
            Influence: "High",
            Reputation: "High",
            Faction: "Knights of Karma",
            DestinationSystem: "Solitude",
            DestinationStation: "Knight's Retreat",
            TargetFaction: "Knights of Colonial Karma",
            Commodity: "Gold",
            Count: 37,
            Target: "Garud",
            TargetType: "$MissionUtil_FactionTag_Pirate;",
            KillCount: 1,
            PassengerType: 'Tourists',
            PassengerCount: 13,
            PassengerIsVIP: true,
            PassengerIsWanted: true,
        });

        js.emit(JournalEvents.missionAccepted, missionAccepted);
        expect(inara.addEvent).toHaveBeenCalledWith(Object.assign(
            new AddCommanderMissionEvent(missionAccepted, "Qa'wakana", "Carpini Terminal"),
            {eventTimestamp: jasmine.any(String)}
        ));
    });

    it('should add a setCommanderMissionAbandonedEvent to the inaraService when abandoned', () => {
        let js: EventEmitter = TestBed.get(JournalService);
        let inara: jasmine.SpyObj<InaraService> = TestBed.get(InaraService);

        let missionAbandoned = Object.assign(new MissionAbandoned(), {
            MissionID: 123456789
        })

        js.emit(JournalEvents.missionAbandoned, missionAbandoned);
        expect(inara.addEvent).toHaveBeenCalledWith(Object.assign(
            new SetCommanderMissionAbandonedEvent(missionAbandoned),
            {eventTimestamp: jasmine.any(String)}
        ));
    });

    it('should add a setCommanderMissionCompletedEvent to the inaraService when completed', () => {
        let js: EventEmitter = TestBed.get(JournalService);
        let inara: jasmine.SpyObj<InaraService> = TestBed.get(InaraService);
        let db: jasmine.SpyObj<DBService> = TestBed.get(DBService);
        db.getEntry.and.callFake(()=>Object.assign(new MissionAccepted(),{Faction: "Knights of Karma"}));

        let missionCompleted = Object.assign(new MissionCompleted(),{
            MissionID: 123456789,
            PermitsAwarded: [],
            CommodityReward: [],
            MaterialsReward: []
        });

        js.emit(JournalEvents.missionCompleted,missionCompleted);
        expect(inara.addEvent).toHaveBeenCalledWith(Object.assign(
            new SetCommanderMissionCompletedEvent(missionCompleted),
            {eventTimestamp: jasmine.any(String)}
        ));
    });

    it('should add a setCommanderMissionFailedEvent to the inaraService when failed', () => {
        let js: EventEmitter = TestBed.get(JournalService);
        let inara: jasmine.SpyObj<InaraService> = TestBed.get(InaraService);

        let missionFailed = Object.assign(new MissionFailed(), {
            MissionID: 123456789
        })

        js.emit(JournalEvents.missionFailed, missionFailed);
        expect(inara.addEvent).toHaveBeenCalledWith(Object.assign(
            new SetCommanderMissionFailedEvent(missionFailed),
            {eventTimestamp: jasmine.any(String)}
        ));
    });

});