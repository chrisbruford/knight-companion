import { InaraService } from './inara.service';
import { InaraEvent } from './models/inara-event.model';
import { HttpClient } from '../../../../node_modules/@angular/common/http';
import { InaraResponse } from './models/inara-response.model';
import { InaraEventResponse } from './models/inara-event-response.model';
import { of } from '../../../../node_modules/rxjs';
import { DBService } from '../services/db.service';
import { JournalService } from '../../journal/journal.service';
import { DBStore } from '../enums/db-stores.enum';
import { AppSetting } from '../enums/app-settings.enum';
import { remote } from 'electron';
import { AddCommanderShipEvent } from './models/add-commander-ship-event.model';
import { EventEmitter } from 'events';
import { async, TestBed } from '../../../../node_modules/@angular/core/testing';

describe('Inara service', () => {
    let inara: InaraService;
    let dummyInaraEvent: InaraEvent;
    let fakeHttp: jasmine.SpyObj<HttpClient>;
    let fakeDB: jasmine.SpyObj<DBService>;
    let fakeJournal: EventEmitter;
    let fakeAPIKey = '123456789abcde';

    beforeEach(async(() => {
        fakeHttp = jasmine.createSpyObj('HttpClient', ['post']);
        fakeDB = jasmine.createSpyObj('DBService', ['getEntry']);

        fakeDB.getEntry.and.callFake((store: string, key: any) => {
            switch (store) {
                case DBStore.appSettings: {
                    switch (key) {
                        case AppSetting.inaraAPIKey: {
                            return of(fakeAPIKey)
                        }
                    }
                }
            }
        });

        fakeJournal = Object.assign(new EventEmitter(), {
            cmdrName: of('Test CMDR')
        });

        TestBed.configureTestingModule({
            providers: [
                { provide: HttpClient, useValue: fakeHttp },
                { provide: DBService, useValue: fakeDB },
                { provide: JournalService, useValue: fakeJournal },
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
                    appName: 'knights-companion',
                    appVersion: remote.app.getVersion(),
                    commanderName: 'Test CMDR',
                    isDeveloped: true
                }),
                events: jasmine.arrayContaining([dummyInaraEvent, dummyInaraEvent, dummyInaraEvent])
            }
        })


        it('should send all batched events to Inara when requested', () => {
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
            expect(inara.getEvents().length).toBe(0);
            expect(fakeHttp.post).toHaveBeenCalledWith(process.env.INARA_API_ENDPOINT, jasmine.objectContaining(expectedSubmission))
        });

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
    })
});