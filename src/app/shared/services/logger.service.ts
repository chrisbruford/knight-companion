import { Injectable } from '@angular/core';
import { ErrorReport } from '../interfaces/errorReport';

@Injectable()
export class LoggerService {
    error(err: ErrorReport): void {
        console.error(err.message,[err]);
    }
}