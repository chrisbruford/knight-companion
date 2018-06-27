import { Component, OnInit } from '@angular/core';
import { UserService } from '../core/services/user.service';
import { LoggerService } from '../core/services/logger.service';
import { User, SimpleUser } from '../shared/interfaces/user';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { ipcRenderer } from 'electron'

@Component({
    selector: 'kok-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    authenticated: boolean;
    submitted: boolean;
    user: User;
    loginForm: FormGroup;

    constructor(
        private userService: UserService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private logger: LoggerService,
        private fb: FormBuilder
    ) {
        this.submitted = false;
    }

    ngOnInit() {

        this.loginForm = this.fb.group({
            username: '',
            password: ''
        })

        this.userService.authCheck()
            .subscribe(
                (user: User) => {
                    this.authenticated = true;
                    this.user = user;
                    let redirect = this.userService.redirect || '/dashboard';
                    this.router.navigate([redirect]);
                },
                (err: any) => this.logger.error({ originalError: err, message: 'AuthCheck Error' })
            );
    }

    onSubmit(): void {
        this.submitted = true;
        this.authenticate({
            username: this.loginForm.get('username').value.toLowerCase(),
            password: this.loginForm.get('password').value
        })
            .subscribe(
                user => {
                    this.authenticated = true;
                    this.user = user;
                    let redirect = this.userService.redirect || '/dashboard';
                    this.router.navigate([redirect]);

                },
                err => {
                    this.authenticated = false;
                    this.user = null;
                });
    }

    authenticate(user: SimpleUser): Observable<User> {
        return this.userService.authenticate(user)
        .pipe(
            map(result => result)
        )
    }

}