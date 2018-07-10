import { TestBed, async, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { DecimalPipe } from '@angular/common';
import { ExplorationComponent } from './exploration.component';
import { BehaviorSubject } from 'rxjs';
import { ExplorationService } from './exploration.service';
import { LightyearPipe } from '../../shared/pipes/ly.pipe';

describe('exploration.component', () => {
    let fixture: ComponentFixture<ExplorationComponent>;
    let component: ExplorationComponent;
    let nativeElement: HTMLElement;
    
    let explorationServiceStub = {
        distanceTravelled: new BehaviorSubject(0),
        jumpsCompleted: new BehaviorSubject(0),
        averageSpeed: new BehaviorSubject(0)
    }

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [{provide: ExplorationService, useValue: explorationServiceStub}, DecimalPipe],
            declarations: [ExplorationComponent, LightyearPipe]
        }).compileComponents()
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExplorationComponent);
        component = fixture.componentInstance;
        nativeElement = fixture.nativeElement;

        fixture.detectChanges();
    })

    it('should exist', () => {
        expect(component).toBeDefined();
    });

    it('should display the total distance travelled', ()=>{
        let distanceTravelled = nativeElement.querySelector('h1');
        
        explorationServiceStub.distanceTravelled.next(1);
        fixture.detectChanges();
        expect(distanceTravelled.textContent).toBe('1ly');

        explorationServiceStub.distanceTravelled.next(10);
        fixture.detectChanges();
        expect(distanceTravelled.textContent).toBe('10ly');

        explorationServiceStub.distanceTravelled.next(100);
        fixture.detectChanges();
        expect(distanceTravelled.textContent).toBe('100ly');

        explorationServiceStub.distanceTravelled.next(1000);
        fixture.detectChanges();
        expect(distanceTravelled.textContent).toBe('1kly');

        explorationServiceStub.distanceTravelled.next(1000000);
        fixture.detectChanges();
        expect(distanceTravelled.textContent).toBe('1Mly');
    });

    it('should display the total average speed', fakeAsync(()=>{
        let averageSpeed = nativeElement.querySelector('.average-speed');
        
        explorationServiceStub.averageSpeed.next(1);
        fixture.detectChanges();
        expect(averageSpeed.textContent).toContain('1ly/hr');

        explorationServiceStub.averageSpeed.next(10);
        fixture.detectChanges();
        expect(averageSpeed.textContent).toContain('10ly/hr');

        explorationServiceStub.averageSpeed.next(100);
        fixture.detectChanges();
        expect(averageSpeed.textContent).toContain('100ly/hr');

        explorationServiceStub.averageSpeed.next(1000);
        fixture.detectChanges();
        expect(averageSpeed.textContent).toContain('1kly/hr');

        explorationServiceStub.averageSpeed.next(1000000);
        fixture.detectChanges();
        expect(averageSpeed.textContent).toContain('1Mly/hr');
    }));
});