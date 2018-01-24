import { Injectable } from '@angular/core';
import { AppError } from '../error-bar/app-error.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class AppErrorService {

    private errorsMap = new Map<string,AppError>();
    private _errors = new BehaviorSubject(this.errorsMap);
    
    get errors() {
        return this._errors.asObservable();
    }

    addError(title: string, error: AppError): Map<string,AppError> {
        let result = this.errorsMap.set(title, error);
        this._errors.next(this.errorsMap);
        return result;
    }

    removeError(title:string): boolean {
        let success = this.errorsMap.delete(title);
        this._errors.next(this.errorsMap);
        return success;
    }

    constructor() { }
}