import { Component, OnInit } from '@angular/core';
import { UserService } from '../core/services/user.service';
import { LoggerService } from '../core/services/logger.service';
import { User, SimpleUser } from '../shared/interfaces/user';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';

@Component({
    selector: 'kok-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    providers: [
        UserService
    ]
})
export class LoginComponent implements OnInit {

    authenticated: boolean;
    submitted: boolean;
    user: User;
        
    simpleUser: SimpleUser = {
        username: undefined,
        password: undefined
    };

    constructor(
        private userService: UserService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private logger: LoggerService
        ) {
        this.submitted = false;
     }

     ngOnInit() {
        this.userService.authCheck().subscribe(
            (res: any)=>{
                this.router.navigate(['/dashboard'])
            },
            (err: any)=>this.logger.error({originalError: err, message: 'AuthCheck Error'})
        )
     }

     onSubmit(): void {
         this.submitted = true;
         this.authenticate(this.simpleUser)
         .then(user=>{
            this.authenticated = true;
            this.user = user;
            this.router.navigate(['/dashboard']);
         })
         .catch(err=>{
             this.authenticated = false;
             this.user = null;
         })
     }

    authenticate(user: SimpleUser): Promise<User> {
        return this.userService.authenticate(user)
        .then(result=>result);
    }
    
 }