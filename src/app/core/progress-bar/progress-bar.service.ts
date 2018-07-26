import { Injectable } from '@angular/core';
import { Observable, Subject, empty } from 'rxjs';
import { concatAll, timeout, catchError, toArray, tap } from 'rxjs/operators';
@Injectable() export class ProgressBarService {
    private _progress = new Subject<Observable<number>>(); 


    get progress() {
        return this._progress.pipe(
            concatAll()
        );
    };

    addProgress(progress: Observable<number>) {
            this._progress.next(progress.pipe(
                timeout(5000),
                catchError(()=>empty())
            ));
    }
}