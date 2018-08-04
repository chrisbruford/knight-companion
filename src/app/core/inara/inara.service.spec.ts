import { InaraService } from './inara.service';
import { InaraEvent } from './models/inara-event.model';
import { HttpClient } from '@angular/common/http';
import { InaraResponse } from './models/inara-response.model';
import { InaraEventResponse } from './models/inara-event-response.model';
import { of, Observable, BehaviorSubject } from 'rxjs';
import { DBService } from '../services/db.service';
import { JournalService } from '../../journal/journal.service';
import { DBStore } from '../enums/db-stores.enum';
import { AppSetting } from '../enums/app-settings.enum';
import { remote } from 'electron';
import { AddCommanderShipEvent } from './models/add-commander-ship-event.model';
import { EventEmitter } from 'events';
import { async, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { SettingsService } from '../../dashboard/settings/settings.service';
import { AppErrorService } from '../services/app-error.service';
import { settings } from 'cluster';

describe('Inara service', () => {
    let inara: InaraService;
    let dummyInaraEvent: InaraEvent;
    let fakeHttp: jasmine.SpyObj<HttpClient>;
    let fakeJournal: EventEmitter;
    let fakeAPIKey = '123456789abcde';

    interface FakeSettingService {
        _settings: BehaviorSubject<{ setting: AppSetting, value: boolean }>;
        getSetting(): { setting: AppSetting, value: boolean },
        settings: Observable<{ setting: AppSetting, value: boolean }>
    }

    beforeEach(async(() => {
        fakeHttp = jasmine.createSpyObj('HttpClient', ['post']);

        let fakeSettingsService: FakeSettingService = {
            _settings: new BehaviorSubject({ setting: AppSetting.inaraBroadcasts, value: true }),
            getSetting: jasmine.createSpy('getSetting').and.callFake(() => of({ setting: AppSetting.inaraBroadcasts, value: false })),
            get settings() { return this._settings.asObservable() }
        }

        let fakeAppErrorService = {};


        (<jasmine.Spy>fakeSettingsService.getSetting).and.callFake((key: any) => {
            switch (key) {
                case AppSetting.inaraAPIKey: {
                    return Promise.resolve({setting: AppSetting.inaraAPIKey, value: fakeAPIKey});
                }
                case AppSetting.inaraBroadcasts: {
                    return Promise.resolve({setting: AppSetting.inaraBroadcasts, value: true})
                }
            }
        });

        fakeJournal = Object.assign(new EventEmitter(), {
            cmdrName: of('Test CMDR')
        });

        TestBed.configureTestingModule({
            providers: [
                { provide: HttpClient, useValue: fakeHttp },
                { provide: SettingsService, useValue: fakeSettingsService },
                { provide: JournalService, useValue: fakeJournal },
                { provide: AppErrorService, useValue: fakeAppErrorService },
                InaraService
            ]
        })
    }));

    beforeEach(() => {
        inara = TestBed.get(InaraService);
    });


    it('should exist', () => {
        expect(inara).toBeDefined();
    });

    it('store events until they are batch submitted', () => {
        dummyInaraEvent = new AddCommanderShipEvent('Python', 123456789);
        expect(inara.getEvents().length).toBe(0);
        inara.addEvent(dummyInaraEvent);
        expect(inara.getEvents().length).toBe(1);
    });

    describe('sendEvents', () => {
        let fakeResponse: InaraResponse;
        let fakeEventResponse: InaraEventResponse;
        let expectedSubmission: any;

        beforeEach(() => {
            fakeResponse = new InaraResponse();
            fakeEventResponse = new InaraEventResponse();
            fakeEventResponse.eventStatus = 200;
            fakeResponse.events = [fakeEventResponse, fakeEventResponse, fakeEventResponse];

            inara.addEvent(dummyInaraEvent);
            inara.addEvent(dummyInaraEvent);
            inara.addEvent(dummyInaraEvent);

            expectedSubmission = {
                header: jasmine.objectContaining({
                    APIkey: fakeAPIKey,
                    appName: 'knight-companion',
                    appVersion: remote.app.getVersion(),
                    commanderName: 'Test CMDR',
                    isDeveloped: true
                }),
                events: jasmine.arrayContaining([dummyInaraEvent, dummyInaraEvent, dummyInaraEvent])
            }
        })


        it('should send all batched events to Inara when requested', fakeAsync(() => {
            fakeResponse.header = {
                eventStatus: 200,
                eventData: {
                    userID: 123456,
                    userName: 'Test User'
                }
            }

            fakeHttp.post.and.callFake((url: string, data: any) => of(fakeResponse));
            expect(inara.getEvents().length).toBe(3);
            inara.submitEvents().subscribe();
            flushMicrotasks();
            expect(inara.getEvents().length).toBe(0);
            expect(fakeHttp.post).toHaveBeenCalledWith(process.env.INARA_API_ENDPOINT, jasmine.objectContaining(expectedSubmission))
        }));

        it('should reject batched events when Inara rejects them', (done) => {
            fakeResponse.header = {
                eventStatus: 400,
                eventData: {
                    userID: 123456,
                    userName: 'Test User'
                }
            }

            fakeHttp.post.and.callFake((url: string, data: any) => of(fakeResponse));
            expect(inara.getEvents().length).toBe(3);
            //test only complete done if error is thrown
            inara.submitEvents().subscribe(
                () => { },
                err => {
                    expect(inara.getEvents().length).toBe(0);
                    expect(fakeHttp.post).toHaveBeenCalledWith(process.env.INARA_API_ENDPOINT, jasmine.objectContaining(expectedSubmission));
                    done()
                });
        });

        it('should not send events when setting is disabled', (() => {
            const settingsService: FakeSettingService = TestBed.get(SettingsService);
            settingsService._settings.next({setting: AppSetting.inaraBroadcasts, value: false});

            expect(inara.getEvents().length).toBe(3);
            inara.submitEvents().subscribe(()=>{},()=>{});
            expect(inara.getEvents().length).toBe(3);
            expect(fakeHttp.post).not.toHaveBeenCalled();
        }));
    })
});