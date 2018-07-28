import { ProgressBarService } from "./progress-bar.service";
import { async, fakeAsync, tick } from "@angular/core/testing";
import { Observable, Observer, from, Subject } from "rxjs";
import { take, delay } from "rxjs/operators";

describe('ProgressBarService',()=>{
    let progressBar: ProgressBarService;

    beforeEach(()=>{
        progressBar = new ProgressBarService();
    });

    it('should exist',()=>{
        expect(progressBar).toBeDefined();
    });

    it('should emit progress values when supplied with an observable of progress',async()=>{
        let progress = from([10,20,30,40,50,60,70,80,90,100]);
        let i = 0;

        progressBar.progress.subscribe((progress: number)=>{
            expect(progress).toBe(i+=10);
        });

        progressBar.addProgress(progress);
    });

    it('should queue up and emit progress values in order and through to completion for multiple progress observables',async()=>{
        let progress1 = from([10,20]);
        let progress2 = from([30,40]);
        let progress3 = from([50,60]);
        
        let i = 0;
        progressBar.progress.subscribe((progress: number)=>{
            expect(progress).toBe(i+=10);
        });

        progressBar.addProgress(progress1);
        progressBar.addProgress(progress2);
        progressBar.addProgress(progress3);
    });

    it('should drop any progress that doesnt progress in 5 seconds',fakeAsync(()=>{

        let progress1 = new Subject<number>();
        let progress2 = new Subject<number>();
        let progress3 = new Subject<number>();
        let progressSpy = jasmine.createSpy('ProgressSpy');

        progressBar.progress.subscribe(
            (progress: number)=>{
                progressSpy(progress);
            }
        );

        progressBar.addProgress(progress1);
        progressBar.addProgress(progress2);
        progressBar.addProgress(progress3);

        progress1.next(15);
        progress1.next(20);
        progress1.complete();

        progress2.next(3);
        setTimeout(()=>{
            progress2.next(7);
            progress2.complete();

            progress3.next(30);
            progress3.next(50);
            progress3.complete();
        },6000)
        
        setTimeout(()=>{
            expect(progressSpy.calls.count()).toBe(5);
            expect(progressSpy).toHaveBeenCalledWith(15);
            expect(progressSpy).toHaveBeenCalledWith(20);
            expect(progressSpy).toHaveBeenCalledWith(3);
            expect(progressSpy).toHaveBeenCalledWith(30);
            expect(progressSpy).toHaveBeenCalledWith(50);
            expect(progressSpy).not.toHaveBeenCalledWith(7);
        }, 7000);

        tick(7000);
    }));
})