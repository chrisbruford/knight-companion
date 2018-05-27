import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, SimpleUser } from '../../shared/interfaces/user';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

@Injectable()
export class UserService {

    private _user = new BehaviorSubject<User | null>(null);

    get user() {
        return this._user.asObservable();
    }

    constructor(private http: HttpClient) { }

    authenticate(user: SimpleUser): Observable<User> {
        let data = Object.assign({ remember: true }, user);
        return this.http.post<User>(`${process.env.API_ENDPOINT}/login`, data)
            .pipe(
                map(user => {
                    if (user) {
                        this._user.next(user);
                        return user;
                    } else {
                        throw new Error("No such user found");
                    }
                }),
                catchError(err => Observable.throw(err))
            )
    };

    authCheck(): Observable<User | null> {
        return this.http.get<User | null>(`${process.env.API_ENDPOINT}/authcheck`)
            .pipe(
                tap(user => {
                    if (user) {
                        this._user.next(user);
                    }
                }),
                catchError(err => Observable.throw(err))
            )
    }

    logout(): Observable<boolean> {
        return this.http.get<boolean>(`${process.env.API_ENDPOINT}/logout`)
            .pipe(
                tap(() => this._user.next(null)),
                catchError(err => Observable.throw(err))
            );
    }

}