import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { NewUser } from '../shared/models/user';
import { UserService, ContinentService, PlatformService } from '../core/services';
import { Observable } from 'rxjs';
import { MatchesValidator } from '../shared/validators/matches.directive';
import { GameRoleService } from '../core/services/game-role.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '../../../node_modules/@angular/material';
import { UsernameValidator } from '../shared/validators/username.directive';
import { KOKEmailValidator } from '../shared/validators/email.directive';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
}) export class RegisterComponent implements OnInit {
    hidepw = true;
    hideconfirmpw = true;
    registrationForm: FormGroup;
    continents: Observable<string[]>;
    platforms: Observable<string[]>;
    gameroles: Observable<string[]>;

    constructor(
        public userService: UserService,
        public fb: FormBuilder,
        public continentService: ContinentService,
        public platformService: PlatformService,
        public gameRoleService: GameRoleService,
        public router: Router,
        public snackBar: MatSnackBar,
        public usernameValidator: UsernameValidator,
        public kokEmailValidator: KOKEmailValidator
    ) { }

    submit() {
        if (this.registrationForm.invalid) { return }
        let newUser: NewUser = {
            username: this.registrationForm.get('username').value,
            password: this.registrationForm.get('password').value,
            shipName: this.registrationForm.get('shipname').value,
            bio: this.registrationForm.get('bio').value,
            continent: this.registrationForm.get('continent').value,
            email: this.registrationForm.get('email').value,
            gameRole: this.registrationForm.get('gamerole').value,
            platform: this.registrationForm.get('platform').value,
            reasonToJoin: this.registrationForm.get('reasontojoin').value
        };
        this.userService.register(newUser)
            .subscribe(
                user => {
                    if (user) {
                        this.router.navigateByUrl('/login');
                    } else {
                        this.snackBar.open("Something went wrong with registration. Please try again.", "Dismiss", {
                            duration: 3000,
                        });
                    }
                },
                error => {
                    this.snackBar.open("Something went wrong with registration. Please try again.", "Dismiss", {
                        duration: 3000,
                    });
                }
            );
    }

    ngOnInit() {
        this.continents = this.continentService.continents;
        this.platforms = this.platformService.platforms;
        this.gameroles = this.gameRoleService.gameRoles;

        this.registrationForm = this.fb.group({
            username: [
                '',
                [],
                this.usernameValidator.checkUsername.bind(this.usernameValidator)
            ],
            password: [''],
            confirmpassword: [''],
            email: [
                '',
                Validators.email,
                this.kokEmailValidator.checkEmail.bind(this.kokEmailValidator)
            ],
            confirmemail: [''],
            platform: [''],
            gamerole: [''],
            shipname: [''],
            bio: [''],
            continent: [''],
            reasontojoin: ['']
        });

        this.registrationForm.get('confirmpassword').setValidators([
            Validators.maxLength(20),
            Validators.minLength(8),
            MatchesValidator(this.registrationForm.get('password'))
        ]);

        this.registrationForm.get('confirmemail').setValidators([
            Validators.email,
            MatchesValidator(this.registrationForm.get('email'))
        ]);

        this.linkValidation(this.registrationForm.get('email'), this.registrationForm.get('confirmemail'))
        this.linkValidation(this.registrationForm.get('password'), this.registrationForm.get('confirmpassword'))
    }

    linkValidation(source: AbstractControl, target: AbstractControl) {
        source.valueChanges.subscribe(() => {
            target.updateValueAndValidity();
        });
    }
}