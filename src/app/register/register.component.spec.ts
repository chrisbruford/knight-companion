import { By } from '@angular/platform-browser';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { KokMaterialModule } from '../kok-material/kok-material.module';
import { UserService } from '../core/services/user.service';
import { User } from '../shared/models';
import { NewUser } from '../shared/models/user';
import { ContinentService, PlatformService } from '../core/services';
import { GameRoleService } from '../core/services/game-role.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, empty, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { UsernameValidator } from '../shared/validators/username.directive';
import { KOKEmailValidator } from '../shared/validators/email.directive';

describe('Register component', () => {
    let fixture: ComponentFixture<RegisterComponent>;
    let component: RegisterComponent;
    let nativeElement: HTMLElement;
    let userService: jasmine.SpyObj<UserService>;
    let fakeUserService: jasmine.SpyObj<UserService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let fakeNewUser: NewUser;
    let fakeNewUserFormData: any;
    let fakeUser: User;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let usernameValidatorSpy: jasmine.SpyObj<UsernameValidator>;
    let emailValidatorSpy: jasmine.SpyObj<KOKEmailValidator>;

    beforeEach(async(() => {
        fakeUserService = jasmine.createSpyObj<UserService>('UserService', ['register']);
        fakeUserService.register.and.callFake((user: NewUser): Observable<User> => of(null));
        routerSpy = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
        snackBarSpy = jasmine.createSpyObj<MatSnackBar>('SnackBar', ['open']);
        usernameValidatorSpy = jasmine.createSpyObj<UsernameValidator>('UsernameValidator', ['checkUsername']);
        usernameValidatorSpy.checkUsername.and.callFake((control: AbstractControl) => of(null));
        emailValidatorSpy = jasmine.createSpyObj<KOKEmailValidator>('EmailValidator', ['checkEmail']);
        emailValidatorSpy.checkEmail.and.callFake((control: AbstractControl) => of(null));

        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, KokMaterialModule, BrowserAnimationsModule],
            declarations: [RegisterComponent],
            providers: [
                { provide: UserService, useValue: fakeUserService },
                { provide: Router, useValue: routerSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
                { provide: UsernameValidator, useValue: usernameValidatorSpy },
                { provide: KOKEmailValidator, useValue: emailValidatorSpy },
                ContinentService,
                GameRoleService,
                PlatformService
            ]
        });
        TestBed.compileComponents();
    }));

    beforeEach(() => {

        fakeNewUser = {
            bio: "Test bio text",
            continent: "Europe",
            email: "test@email.com",
            password: "12345678",
            gameRole: "Bounty Hunting",
            platform: "PC",
            username: "Test CMDR Name",
            shipName: "KV Tester",
            reasonToJoin: "To perform the mightiest of tests"
        };

        fakeNewUserFormData = {
            username: "Test CMDR Name",
            password: "12345678",
            confirmpassword: "12345678",
            email: "test@email.com",
            confirmemail: "test@email.com",
            platform: "PC",
            gamerole: "Bounty Hunting",
            shipname: "KV Tester",
            bio: "Test bio text",
            continent: "Europe",
            reasontojoin: "To perform the mightiest of tests",
        };

        fakeUser = {
            username: "Test CMDR Name",
            email: "test@email.com",
            platform: "PC",
            gameRole: "Bounty Hunting",
            shipName: "KV Tester",
            bio: "Test bio text",
            continent: "Europe",
            reasonToJoin: "To perform the mightiest of tests",
            level: 4,
            activated: true,
            avatar: "none",
            token: "lotsoffakelettersandnumb3rs",
            expire: new Date(),
            createdAt: new Date(),
            wings: [{},{},{},{}],
            discordID: "141575602162499585"
        }

        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        nativeElement = fixture.nativeElement;
        userService = fixture.debugElement.injector.get(UserService) as jasmine.SpyObj<UserService>;
    });

    it('should exist', () => {
        expect(component).toBeDefined();
    });

    it('should submit a user to the userService for registration', () => {
        component.ngOnInit();
        component.registrationForm.setValue(fakeNewUserFormData);
        fixture.debugElement.query(By.css('form')).triggerEventHandler('ngSubmit', null);
        expect(userService.register.calls.count()).toBe(1);
        expect(userService.register).toHaveBeenCalledWith(fakeNewUser);
    });

    it('should not submit an invalid form',()=>{
        component.ngOnInit();
        component.registrationForm.setValue({
            username: 'thisusernameisridiculouslytoolongforustoeventhinkaboutusingimo.Letspretenditdidnthappen',
            password: '123456',
            confirmpassword: '654321',
            email: 'invalid',
            confirmemail: 'email',
            continent: 'Atlantis',
            platform: 'Atari',
            gamerole: 'Retreat',
            shipname: 'thisshipnameisridiculouslytoolongforustoeventhinkaboutusingimo.Letspretenditdidnthappen',
            bio: 'pretty much anything is valid here',
            reasontojoin: 'pretty much anything is valid here'
        });
        fixture.detectChanges();
        fixture.debugElement.query(By.css('form')).triggerEventHandler('ngSubmit',null);
        expect(userService.register.calls.count()).toBe(0);
    });

    it('should be invalid if password confirmation doesn\'t match', ()=>{
        component.ngOnInit();
        component.registrationForm.setValue(Object.assign(fakeNewUserFormData,{confirmpassword: 'this doesn\'t match'}));
        fixture.debugElement.query(By.css('form')).triggerEventHandler('ngSubmit',null);
        expect(userService.register.calls.count()).toBe(0);
    });

    it('should be invalid if email confirmation doesn\'t match', ()=>{
        component.ngOnInit();
        component.registrationForm.setValue(Object.assign(fakeNewUserFormData,{confirmemail: 'email@doesnt.match'}));
        fixture.debugElement.query(By.css('form')).triggerEventHandler('ngSubmit',null);
        expect(userService.register.calls.count()).toBe(0);
    });

    it('should redirect the user to login page on success',()=>{
        component.ngOnInit();
        component.registrationForm.setValue(fakeNewUserFormData);

        userService.register.and.callFake(()=>{
            let user = new User();
            Object.assign(user,fakeNewUser);
            return of(user);
        });

        fixture.debugElement.query(By.css('form')).triggerEventHandler('ngSubmit',null);
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
    });

    it('should handle submission errors gracefully',()=>{
        component.ngOnInit();
        component.registrationForm.setValue(fakeNewUserFormData);

        userService.register.and.callFake(()=>{
            return throwError({});
        });

        fixture.debugElement.query(By.css('form')).triggerEventHandler('ngSubmit',null);
        expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
        expect(snackBarSpy.open).toHaveBeenCalled();
    });

    it('should not accept duplicate usernames',async(()=>{
        component.ngOnInit();
        usernameValidatorSpy.checkUsername.and.returnValue(of({'usernameTaken': {value: 'A Taken Username'} }) )
        component.registrationForm.setValue(fakeNewUserFormData);
        fixture.whenStable().then(()=>{
            expect(component.registrationForm.invalid).toBeTruthy();
        });
    }));

    it('should not accept duplicate email addresses',async(()=>{
        component.ngOnInit();
        emailValidatorSpy.checkEmail.and.returnValue(of({'emailTaken': {value: 'a@taken.email'} }) )
        component.registrationForm.setValue(fakeNewUserFormData);
        fixture.whenStable().then(()=>{
            expect(component.registrationForm.invalid).toBeTruthy();
        });
    }));

    it('should revalidate email confirmation if email is changed',()=>{
        component.ngOnInit();
        component.registrationForm.setValue(Object.assign(fakeNewUserFormData));
        fixture.debugElement.query(By.css('form')).triggerEventHandler('ngSubmit',null);
        expect(userService.register.calls.count()).toBe(1);
        
        component.registrationForm.get('email').setValue('this@doesnt.match');
        fixture.debugElement.query(By.css('form')).triggerEventHandler('ngSubmit',null);
        expect(userService.register.calls.count()).toBe(1);
    });

    it('should revalidate password confirmation if password is changed',()=>{
        component.ngOnInit();
        component.registrationForm.setValue(Object.assign(fakeNewUserFormData));
        fixture.debugElement.query(By.css('form')).triggerEventHandler('ngSubmit',null);
        expect(userService.register.calls.count()).toBe(1);

        component.registrationForm.get('password').setValue('this doesn\'t match');
        fixture.debugElement.query(By.css('form')).triggerEventHandler('ngSubmit',null);
        expect(userService.register.calls.count()).toBe(1);
    });
})