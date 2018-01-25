import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppErrorService } from './core/services/app-error.service';
import { UserService } from './core/services/user.service';
import { LoggerService } from './core/services/logger.service';
import { ipcRenderer } from 'electron';
import { NgZone } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent { 
    constructor(
        private appErrorService: AppErrorService,
        private userService: UserService,
        private router: Router,
        private logger: LoggerService,
        private zone: NgZone
    ) {
        ipcRenderer.on('logout',()=>{
            zone.run(this.logout.bind(this))
        });
     }

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