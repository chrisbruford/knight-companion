import { UserService } from "../core/services";
import { User } from "../shared/models";
import { Component } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ContinentService } from "../core/services/continent-service";
import { Observable } from "rxjs";
import { takeWhile } from "rxjs/operators";
import { PlatformService } from "../core/services/platform-service";

@Component({
    selector: 'kok-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

    private user: User | null = null;
    private profileForm: FormGroup;
    private continents: Observable<string[]>;
    private platforms: Observable<string[]>;
    private alive = true;

    constructor(
        private userService: UserService,
        private fb: FormBuilder,
        private continentService: ContinentService,
        private platformService: PlatformService
    ) { }

    ngOnInit() {

        this.continents = this.continentService.continents;
        this.platforms = this.platformService.platforms;

        this.profileForm = this.fb.group({
            username: {value: "", disabled: true},
            continentSelect: {value: "", disabled: true},
            platformSelect: {value: "", disabled: true},
            bio: {value: "", disabled: true}
        });

        this.userService.user.pipe(
            takeWhile(()=>this.alive)
        )
        .subscribe(user => {
            if (user) {
                this.user = user;
                this.profileForm.setValue({
                    username: this.user.username || "",
                    continentSelect: this.user.continent || "",
                    bio: this.user.bio || "",
                    platformSelect: this.user.platform || ""
                });
            }
        });
    }

    ngOnDestroy() {
        this.alive = false;
    }

    

}