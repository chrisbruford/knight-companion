import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators/catchError';
import { Interdicted, RedeemVoucher } from 'cmdr-journal';
import { LoggerService } from '../../core/services/logger.service';

@Injectable()
export class CombatService {
    constructor(
        private http: HttpClient,
        private logger: LoggerService
    ) { }

    interdictedAlert(interdicted: Interdicted, cmdrName: string, system: string): Observable<boolean> {
        return this.http.post(`${process.env.API_ENDPOINT}/combat/interdicted/${cmdrName}`, { interdicted, system })
            .catch((err: any) => {
                this.logger.error(err);
                return Observable.throw(err);
            })
    }

    bondsAlert(redeemVoucher: RedeemVoucher, cmdrName: string): Observable<boolean> {
        return this.http.post(`${process.env.API_ENDPOINT}/combat/redeemVoucher`, {redeemVoucher, cmdrName})
            .pipe(catchError((err: any)=>{
                this.logger.error(err);
                return Observable.throw(err);
            }))
    }
}