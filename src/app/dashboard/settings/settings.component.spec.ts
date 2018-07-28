import { TestBed, async, ComponentFixture } from "../../../../node_modules/@angular/core/testing";
import { SettingsComponent } from "./settings.component";
import { DebugElement } from "../../../../node_modules/@angular/core";

describe("SettingsComponent",()=>{

    let fixture: ComponentFixture<SettingsComponent>;
    let de: DebugElement;
    let element: HTMLElement;

    beforeEach(async(()=>{
        TestBed.configureTestingModule({
            declarations: [SettingsComponent]
        }).compileComponents();
    }));

    beforeEach(()=>{
        fixture = TestBed.createComponent(SettingsComponent);
        de = fixture.debugElement;
        element = de.nativeElement;
    });

});