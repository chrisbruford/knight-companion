import { Component } from '@angular/core';
import { UserService } from '../shared/services/user.service';
import { User, SimpleUser } from '../shared/interfaces/user';

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
    simpleUser: SimpleUser;

    constructor(private userService: UserService) {
        this.submitted = false;
        this.simpleUser = {
            username: "",
            password: ""
        }
     }

     onSubmit(): void {
         this.submitted = true;
         this.authenticate(this.simpleUser)
         .then(user=>{
            this.authenticated = true;
            this.user = user;
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