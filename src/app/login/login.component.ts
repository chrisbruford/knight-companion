import { Component } from '@angular/core';
import { UserService } from '../shared/services/user.service';
import { User, SimpleUser } from '../shared/interfaces/user';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'kok-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    providers: [
        UserService
    ]
})
export class LoginComponent {

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
        private router: Router
        ) {
        this.submitted = false;
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