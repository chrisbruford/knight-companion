import { Injectable } from '@angular/core';
import { AppError } from '../error-bar/app-error.model';
import { BehaviorSubject } from 'rxjs';
import { AppErrorTitle } from '../error-bar/app-error-title.enum';

@Injectable()
export class AppErrorService {

    private errorsMap = new Map<AppErrorTitle,AppError>();
    private _errors = new BehaviorSubject(this.errorsMap);
    
    get errors() {
        return this._errors.asObservable();
    }

    addError(title: AppErrorTitle, error: AppError): Map<AppErrorTitle,AppError> {
        let result = this.errorsMap.set(title, error);
        this._errors.next(this.errorsMap);
        return result;
    }

    removeError(title:AppErrorTitle): boolean {
        let success = this.errorsMap.delete(title);
        this._errors.next(this.errorsMap);
        return success;
    }

    constructor() { }
}