import { BroadcastService } from "./broadcast.service";
import { HttpClient } from "@angular/common/http";
import { SettingsService } from "../../dashboard/settings/settings.service";
import { async, TestBed } from "@angular/core/testing";
import { Subject } from "rxjs";
import { AppSetting } from "../enums/app-settings.enum";

interface SettingsServiceStub {
    settings: Subject<{ setting: AppSetting, value: any }>,
    getSetting(): Promise<any>
}

describe('Broadcast Service', () => {
    let broadcastService: BroadcastService;
    let http: jasmine.SpyObj<HttpClient>;

    beforeEach(async(() => {
        let http = jasmine.createSpyObj('HttpClient', ['post']);
        let settingsService = {
            settings: new Subject<{ setting: AppSetting, value: any }>(),
            getSetting: jasmine.createSpy('getSetting').and.callFake(()=> Promise.resolve(false))
        }

        TestBed.configureTestingModule({
            providers: [
                { provide: HttpClient, useValue: http },
                { provide: SettingsService, useValue: settingsService },
                BroadcastService
            ]
        });
    }));

    beforeEach(() => {
        broadcastService = TestBed.get(BroadcastService);
    });

    it('should exist', () => {
        expect(broadcastService).toBeDefined();
    });

    it('not send broadcasts if they are turned off', () => {
        const url = 'http://www.dummyurl.com';
        const message = 'test broadcast';

        let settings: SettingsServiceStub = TestBed.get(SettingsService);
        let http = TestBed.get(HttpClient);
        settings.settings.next({setting: AppSetting.broadcasts, value: false});
        broadcastService.broadcast(url, message);
        expect(http.post).not.toHaveBeenCalled();

        settings.settings.next({setting: AppSetting.broadcasts, value: true});
        broadcastService.broadcast(url, message);
        expect(http.post).toHaveBeenCalledWith(url, message);
    });
});