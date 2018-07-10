import { AbstractControl } from "@angular/forms";
import { UserService } from "../../core/services";
import { Injectable } from "@angular/core";
import { map, catchError, switchMap } from "rxjs/operators";
import { Observable, throwError, timer } from "rxjs";

@Injectable()
export class KOKEmailValidator {
    constructor(public userService: UserService) { }

    checkEmail(control: AbstractControl): Observable<{ [key: string]: any } | null> {
        return timer(500).pipe(
            switchMap((() => this.userService.getUsersByEmail(control.value))),
            map(users => {
                if (users.length > 0) {
                    return { 'emailTaken': { value: control.value } }
                }
                return null;
            }),
            catchError(err => {
                return throwError(err);
            })
        )
    }
}