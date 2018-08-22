import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppErrorService } from './core/services/app-error.service';
import { UserService } from './core/services/user.service';
import { LoggerService } from './core/services/logger.service';
import { ipcRenderer, Event } from 'electron';
import { UpdateCheckResult } from 'electron-updater';
import { NgZone } from '@angular/core';
import { takeWhile } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material';
import { Observable } from 'rxjs';
import { JournalService } from './journal/journal.service';


@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    private alive = true;
    private journalProgress: Observable<number>;

    constructor(
        public appErrorService: AppErrorService,
        private userService: UserService,
        private router: Router,
        private logger: LoggerService,
        private zone: NgZone,
        private snackBar: MatSnackBar,
        private journalService: JournalService
    ) {
        this.journalProgress = journalService.initialLoadProgress;
        ipcRenderer.on('logout', () => {
            zone.run(this.logout.bind(this));
            ipcRenderer.send("rebuild-menu", { login: true });
        });

        ipcRenderer.on('login', () => {
            ipcRenderer.send("rebuild-menu", { login: true });
            zone.run(() => {
                this.userService.redirect = this.router.url;
                this.router.navigate(["/"]);
            })
        });

        ipcRenderer.on('navigate', (evt: Event, url: string) => {
            zone.run(() => {
                this.router.navigate(url.split("/"));
            })
        });

        ipcRenderer.on('message', function (event: any, text: string) {
            console.log(text);
        });

        ipcRenderer.on('update-ready', (evt: Event, res: UpdateCheckResult) => {
            console.log(res);
            let snackBar = this.openSnackBar('Update ready...',"Install");
            snackBar.onAction().subscribe(()=>{
                ipcRenderer.send('do-update');
            })
        });

        ipcRenderer.on('update-download-progress',(evt: Event, progress: any)=>{
            //TODO: Show progress to user
        }) 
    }

    logout() {
        this.userService.logout()
            .pipe(
                takeWhile(() => this.alive)
            )
            .subscribe(
                success => {
                    if (success) {
                        this.userService.redirect = '';
                        this.router.navigate(['/'])
                    } else {
                        this.logger.error({ originalError: new Error(''), message: 'Failed to log out user' });
                    }
                },
                err => {
                    this.logger.error({ originalError: err, message: 'Error thrown while logging out' });
                }
            )
    }

    openSnackBar(message: string, action: string): MatSnackBarRef<SimpleSnackBar> {
        let snackBar: MatSnackBarRef<SimpleSnackBar>;
        this.zone.run(()=>{
            snackBar = this.snackBar.open(message,action);
        });
        return snackBar;
    }

    ngOnDestroy() {
        this.alive = false;
    }
}