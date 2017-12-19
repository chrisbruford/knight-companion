import { Injectable } from '@angular/core';
import { ErrorReport } from '../../shared/interfaces/errorReport';

@Injectable()
export class LoggerService {
    error(err: ErrorReport): void {
        console.error(err.message,[err]);
    }
}