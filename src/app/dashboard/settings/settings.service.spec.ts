import { SettingsService } from './settings.service'
import { DBService } from '../../core/services/db.service';
import { DBStore } from '../../core/enums/db-stores.enum';
import { AppSetting } from '../../core/enums/app-settings.enum';
describe("SettingsService", () => {
    let settingsService: SettingsService;
    let dbServiceSpy: jasmine.SpyObj<DBService>;

    beforeEach(() => {
        dbServiceSpy = jasmine.createSpyObj<DBService>('DBService', ['putEntry', 'getEntry']);
        settingsService = new SettingsService(dbServiceSpy);
    });

    it('should exist', () => {
        expect(settingsService).toBeDefined();
    });

    it('should pass settings to the DB service for persisting', () => {
        dbServiceSpy.putEntry.and.callFake(() => Promise.resolve(true));
        settingsService.updateSetting(AppSetting.inaraAPIKey, '123456789abcde');
        expect(dbServiceSpy.putEntry)
            .toHaveBeenCalledWith(
                DBStore.appSettings,
                jasmine.objectContaining({ key: AppSetting.inaraAPIKey, value: '123456789abcde' })
            )
    });

    it('should fetch settings from the DB service', (done) => {
        dbServiceSpy.getEntry.and.callFake((store: string, entry: string) => {
            return Promise.resolve('123456789abcde');
        });

        let setting = settingsService.getSetting(AppSetting.inaraAPIKey);
        setting.then(setting => {
            expect(setting).toEqual('123456789abcde');
            done();
        });
    });

    it('should return cached settings if available', (done) => {
        dbServiceSpy.getEntry.and.callFake(() => Promise.resolve(undefined));
        dbServiceSpy.putEntry.and.callFake(() => Promise.resolve(true));

        settingsService.updateSetting(AppSetting.broadcasts, true)
            .then(() => {
                settingsService.getSetting(AppSetting.broadcasts)
                    .then(setting => {
                        expect(setting).toEqual(true);
                        expect(dbServiceSpy.getEntry).not.toHaveBeenCalled();
                        done();
                    });
            })
    });

    it('should cache a setting if fetched from DB', (done) => {
        dbServiceSpy.getEntry.and.callFake(() => Promise.resolve(true));

        settingsService.getSetting(AppSetting.broadcasts)
            .then(setting => {
                expect(setting).toEqual(true);
                expect(dbServiceSpy.getEntry).toHaveBeenCalled();
                dbServiceSpy.getEntry.calls.reset();
            })
            .then(()=>settingsService.getSetting(AppSetting.broadcasts))
            .then(setting=>{
                expect(setting).toEqual(true);
                expect(dbServiceSpy.getEntry).not.toHaveBeenCalled();
                done();
            })
    });

    it('should cache a setting when set',(done)=>{
        dbServiceSpy.putEntry.and.callFake(() => Promise.resolve(true));

        settingsService.updateSetting(AppSetting.broadcasts, true)
            .then(() => {
                settingsService.getSetting(AppSetting.broadcasts)
                    .then(setting => {
                        expect(setting).toEqual(true);
                        expect(dbServiceSpy.getEntry).not.toHaveBeenCalled();
                        done();
                    });
            })
    });

})