import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, SimpleUser } from '../../shared/interfaces/user';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class UserService {

    user: User;

    constructor(private http: HttpClient) { }

    authenticate(user: SimpleUser): Observable<User> {
        let data = Object.assign({ remember: true }, user);
        return this.http.post<User>(`${process.env.API_ENDPOINT}/login`, data)
            .map(user => {
                if (user) {
                    this.user = user;
                    return user;
                } else {
                    return Observable.throw(new Error("No such user found"));
                }
            })
            .pipe(
            catchError(err => Observable.throw(err))
            )
    };

    authCheck(): Observable<User | null> {
        return this.http.get<User | null>(`${process.env.API_ENDPOINT}/authcheck`)
            .pipe(
            catchError(err => Observable.throw(err))
            )
    }

    logout(): Observable<boolean> {
        return this.http.get<boolean>(`${process.env.API_ENDPOINT}/logout`)
            .pipe(
            catchError(err => Observable.throw(err))
            );
    }

}