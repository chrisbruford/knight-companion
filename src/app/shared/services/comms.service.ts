import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http'
import { Observable } from 'rxjs';

@Injectable()
export class CommsService {
    constructor(
        private http: Http
    ) {}

    post(url: string,data: any): Observable<any> {
        return this.http.post(url,data)
            .catch((err)=>{
                console.log(err);
                return Observable.throw(err);
            })
    }
    
}