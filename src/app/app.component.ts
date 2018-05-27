import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppErrorService } from './core/services/app-error.service';
import { UserService } from './core/services/user.service';
import { LoggerService } from './core/services/logger.service';
import { ipcRenderer, IpcMessageEvent, Event } from 'electron';
import { NgZone } from '@angular/core';
import { takeWhile } from 'rxjs/operators';

declare function buildKokMenu(arg: {login: boolean}): void;

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

    private alive = true;

    constructor(
        private appErrorService: AppErrorService,
        private userService: UserService,
        private router: Router,
        private logger: LoggerService,
        private zone: NgZone,
    ) {
        ipcRenderer.on('logout',()=>{
            zone.run(this.logout.bind(this));
            ipcRenderer.send("rebuild-menu",{login: true});
        });

        ipcRenderer.on('login',()=>{
            ipcRenderer.send("rebuild-menu",{login: true});
            zone.run(()=>{
                this.router.navigate(["/"]);
            })
        });

        ipcRenderer.on('navigate',(evt: Event, url:string)=>{
            zone.run(()=>{
                this.router.navigate(url.split("/"));
            })
        });
     }

    logout() {
        this.userService.logout()
        .pipe(
            takeWhile(()=>this.alive)
        )
        .subscribe(
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

    ngOnDestroy() {
        this.alive = false;
    }
}