import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';
import { Interdicted } from 'cmdr-journal';
import { LoggerService } from '../shared/services/logger.service';

@Injectable()
export class InterdictionService {
    constructor(
        private http: Http,
        private logger: LoggerService
        ) { }

    interdictedAlert(interdicted: Interdicted,cmdrName: string):void {
            this.http.post(`https://www.knightsofkarma.com/api/interdicted/${cmdrName}`,{interdicted})
                .catch((err: any) =>{
                    this.logger.error(err);
                    return Observable.throw(err);
                })
        }
}