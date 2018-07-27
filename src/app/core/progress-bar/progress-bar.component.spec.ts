import { async, TestBed, ComponentFixture, fakeAsync, tick, flush } from "@angular/core/testing";
import { KOKProgressBarComponent } from "./progress-bar.component";
import { ProgressBarService } from "./progress-bar.service";
import { KokMaterialModule } from "../../kok-material/kok-material.module";
import { BehaviorSubject, Subject } from "rxjs";

describe("ProgressBar", () => {
    let fixture: ComponentFixture<KOKProgressBarComponent>;
    let component: KOKProgressBarComponent;
    let element: HTMLElement;
    let progressService: ProgressBarService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [KOKProgressBarComponent],
            providers: [ProgressBarService],
            imports: [KokMaterialModule]
        }).compileComponents();

    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(KOKProgressBarComponent);
        component = fixture.componentInstance;
        element = fixture.nativeElement;
        progressService = fixture.debugElement.injector.get(ProgressBarService);
        fixture.detectChanges();
    });

    it('should exist', () => {
        expect(fixture).toBeDefined();
    })

    it('should display display the progress bar when progress is not 0 or 100', (() => {
        let progress = new Subject<number>();
        progressService.addProgress(progress.asObservable());

        progress.next(0);
        fixture.detectChanges();
        let progressBar: HTMLElement = element.querySelector('mat-progress-bar');
        expect(progressBar.style.opacity).toBe('0');

        progress.next(100);
        fixture.detectChanges();
        progressBar = element.querySelector('mat-progress-bar');
        expect(progressBar.style.opacity).toBe('0');

        progress.next(50);
        fixture.detectChanges();
        progressBar = element.querySelector('mat-progress-bar');
        expect(progressBar.style.opacity).toBe('1');
        expect(component.styles.opacity).toBe('1');
    }));
});