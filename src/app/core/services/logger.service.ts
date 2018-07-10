import { Injectable } from '@angular/core';
import { ErrorReport } from '../../shared/models/errorReport';

@Injectable()
export class LoggerService {
    error(err: ErrorReport): void {
        console.error(err.message,[err]);
    }
}