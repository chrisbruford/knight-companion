import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild } from "@angular/router";
import { Observable, of } from "rxjs";
import { UserService } from "../services";
import { map, catchError } from "rxjs/operators";

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
    constructor(
        private userService: UserService,
        private router: Router
    ) { }
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean | Observable<boolean> | Promise<boolean> {
        return this.userService.authCheck()
            .pipe(
                map(user => {
                    if (user) {
                        return true;
                    } else {
                        this.userService.redirect = state.url;
                        this.router.navigate(['/login']);
                        return false;
                    }
                }),
                catchError(err =>{
                    this.userService.redirect = state.url;
                    this.router.navigate(['/login']);
                    return of(false);
                })
            );
    }

    canActivateChild(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean | Observable<boolean> | Promise<boolean> {
        return this.userService.authCheck()
            .pipe(
                map(user => {
                    if (user) {
                        return true;
                    } else {
                        this.userService.redirect = state.url;
                        this.router.navigate(['/login']);
                        return false;
                    }
                }),
                catchError(err => {
                    this.userService.redirect = state.url;
                    this.router.navigate(['/login']);
                    return of(false)
                })
            )
    }
}