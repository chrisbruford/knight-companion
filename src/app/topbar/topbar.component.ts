import { Component } from "@angular/core";
import { UserService } from "../core/services/user.service";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { LoggerService } from "../core/services/logger.service";

@Component({
    selector: 'app-topbar',
    templateUrl: './topbar.component.html',
    styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent {
    constructor(
        private userService: UserService,
        private route: ActivatedRoute,
        private router: Router,
        private logger: LoggerService
    ) {}

    logout() {
        this.userService.logout().subscribe(
            success =>{
                if (success) {
                    this.router.navigate(['/'])
                } else {
                    this.logger.error({originalError: new Error(''), message: 'Failed to log out user'});
                }
            },
            err => {
                this.logger.error({originalError: err, message: 'Error thrown while logging out'});
            }
        )
    }
}