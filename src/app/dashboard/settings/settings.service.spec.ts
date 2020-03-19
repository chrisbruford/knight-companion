import { SettingsService } from "./settings.service";
import { DBService } from "../../core/services/db.service";
import { DBStore } from "../../core/enums/db-stores.enum";
import { AppSetting } from "../../core/enums/app-settings.enum";
import { UserService } from "../../core/services";
import { of, BehaviorSubject } from "rxjs";
import { async, TestBed } from "@angular/core/testing";
describe("SettingsService", () => {
  let settingsService: SettingsService;
  let mockUser = new BehaviorSubject({});
  const dbServiceSpy = jasmine.createSpyObj<DBService>("DBService", [
    "putEntry",
    "getEntry"
  ]);

  beforeEach(async(() => {
    const userService = {
      user: mockUser
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: UserService, useValue: userService },
        { provide: DBService, useValue: dbServiceSpy }
      ]
    });
  }));

  beforeEach(() => {
    settingsService = TestBed.get(SettingsService);
  });

  afterEach(() => {
    dbServiceSpy.getEntry.calls.reset();
  });

  it("should exist", () => {
    expect(settingsService).toBeDefined();
  });

  it("should pass settings to the DB service for persisting", () => {
    dbServiceSpy.putEntry.and.callFake(() => Promise.resolve(true));
    settingsService.updateSetting(AppSetting.inaraAPIKey, "123456789abcde");
    expect(dbServiceSpy.putEntry).toHaveBeenCalledWith(
      DBStore.appSettings,
      jasmine.objectContaining({
        key: AppSetting.inaraAPIKey,
        value: "123456789abcde"
      })
    );
  });

  it("should fetch settings from the DB service", done => {
    dbServiceSpy.getEntry.and.callFake((store: string, entry: string) => {
      return Promise.resolve("123456789abcde");
    });

    let setting = settingsService.getSetting(AppSetting.inaraAPIKey);
    setting.then(setting => {
      expect(setting).toEqual("123456789abcde");
      done();
    });
  });

  it("should return cached settings if available", done => {
    dbServiceSpy.getEntry.and.callFake(() => Promise.resolve(undefined));
    dbServiceSpy.putEntry.and.callFake(() => Promise.resolve(true));

    settingsService.updateSetting(AppSetting.broadcasts, true).then(() => {
      settingsService
        .getSetting(AppSetting.broadcasts)
        .then((setting: { setting: AppSetting; value: any }) => {
          expect(setting.value).toEqual(true);
          expect(dbServiceSpy.getEntry).not.toHaveBeenCalled();
          done();
        });
    });
  });

  it("should cache a setting if fetched from DB", done => {
    dbServiceSpy.getEntry.and.callFake(() =>
      Promise.resolve({ setting: AppSetting.broadcasts, value: true })
    );

    settingsService
      .getSetting(AppSetting.broadcasts)
      .then((setting: { setting: AppSetting; value: any }) => {
        expect(setting.value).toEqual(true);
        expect(dbServiceSpy.getEntry).toHaveBeenCalledTimes(1);
      })
      .then(() => settingsService.getSetting(AppSetting.broadcasts))
      .then((setting: { setting: AppSetting; value: any }) => {
        expect(setting.value).toEqual(true);
        expect(dbServiceSpy.getEntry).toHaveBeenCalledTimes(1);
        done();
      });
  });

  it("should cache a setting when set", done => {
    dbServiceSpy.putEntry.and.callFake(() => Promise.resolve(true));

    settingsService.updateSetting(AppSetting.broadcasts, true).then(() => {
      settingsService
        .getSetting(AppSetting.broadcasts)
        .then((setting: { setting: AppSetting; value: any }) => {
          expect(setting.value).toEqual(true);
          expect(dbServiceSpy.getEntry).not.toHaveBeenCalled();
          done();
        });
    });
  });

  it("should clear the settings cache when the user logs out", done => {
    dbServiceSpy.getEntry.and.callFake(() =>
      Promise.resolve({ setting: AppSetting.broadcasts, value: true })
    );

    settingsService
      .getSetting(AppSetting.broadcasts)
      .then((setting: { setting: AppSetting; value: any }) => {
        expect(setting.value).toEqual(true);
        expect(dbServiceSpy.getEntry).toHaveBeenCalledTimes(1);
      })
      .then(() => {
        mockUser.next(null);
        mockUser.next({});
      })
      .then(() => settingsService.getSetting(AppSetting.broadcasts))
      .then((setting: { setting: AppSetting; value: any }) => {
        expect(setting.value).toEqual(true);
        expect(dbServiceSpy.getEntry).toHaveBeenCalledTimes(2);
        done();
      });
  });
});
