import { Injectable } from '@angular/core';
import { AppError } from '../error-bar/app-error.model';

@Injectable()
export class AppErrorService {
    errors: AppError[];

    constructor() {}
}