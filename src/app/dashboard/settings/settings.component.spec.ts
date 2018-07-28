import { TestBed, async, ComponentFixture, fakeAsync } from "../../../../node_modules/@angular/core/testing";
import { SettingsComponent } from "./settings.component";
import { DebugElement } from "../../../../node_modules/@angular/core";
import { FormsModule, ReactiveFormsModule } from "../../../../node_modules/@angular/forms";
import { By } from "../../../../node_modules/@angular/platform-browser";
import { SettingsService } from "./settings.service";
import { KokMaterialModule } from "../../kok-material/kok-material.module";
import { MatSlideToggleChange, MatSlideToggle } from "../../../../node_modules/@angular/material";
import { BrowserAnimationsModule } from "../../../../node_modules/@angular/platform-browser/animations";
import { AppSetting } from '../../core/enums/app-settings.enum';

describe("SettingsComponent", () => {

    let fixture: ComponentFixture<SettingsComponent>;
    let de: DebugElement;
    let element: HTMLElement;
    let component: SettingsComponent;
    let settingsService: jasmine.SpyObj<SettingsService>;

    beforeEach(async(() => {
        let _settingsService = jasmine.createSpyObj<SettingsService>('SettingsService', ['getSetting', 'updateSetting']);
        _settingsService.getSetting.and.callFake((setting: string) => Promise.resolve({key: setting, value: true}));

        TestBed.configureTestingModule({
            declarations: [SettingsComponent],
            imports: [FormsModule, ReactiveFormsModule, KokMaterialModule, BrowserAnimationsModule],
            providers: [{ provide: SettingsService, useValue: _settingsService }]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SettingsComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        element = de.nativeElement;
        settingsService = de.injector.get(SettingsService) as jasmine.SpyObj<SettingsService>;
        fixture.detectChanges();
    });

    describe("broadcasts", () => {

        it('should init in state from db', fakeAsync(() => {
            fixture.whenStable().then(() => {
                expect(component.settingsForm.get('broadcasts').value).toBe(true);
            });
        }));

        it('should toggle on/off', () => {
            settingsService.updateSetting.and.callFake((setting: string, value: any) => Promise.resolve(true));
            const broadcastsToggle: MatSlideToggle = de.query(By.css('[formControlName="broadcasts"] input')).componentInstance;
            broadcastsToggle.change.emit(new MatSlideToggleChange(broadcastsToggle, true));
            expect(settingsService.updateSetting).toHaveBeenCalledWith(AppSetting.broadcasts, jasmine.any(Boolean));
        });

    });

    describe("inara", () => {

        it('should init in state from db', fakeAsync(() => {
            fixture.whenStable().then(() => {
                expect(component.settingsForm.get('inaraBroadcasts').value).toBe(true);
            });
        }));

        it('should toggle integration on/off', () => {
            settingsService.updateSetting.and.callFake((setting: string, value: any) => Promise.resolve(true));
            const broadcastsToggle: MatSlideToggle = de.query(By.css('[formControlName="inaraBroadcasts"] input')).componentInstance;
            broadcastsToggle.change.emit(new MatSlideToggleChange(broadcastsToggle, true));
            expect(settingsService.updateSetting).toHaveBeenCalledWith(AppSetting.inaraBroadcasts, jasmine.any(Boolean));
        });

    })


});