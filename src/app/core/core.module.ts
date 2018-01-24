import { NgModule } from '@angular/core';
import { AppSettingsService } from './app-settings.service';
import { LoggerService, UserService, RE, FactionService  } from './services';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppErrorService } from './services/app-error.service';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorBarComponent } from './error-bar/error-bar.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        SharedModule
    ],
    exports: [
        BrowserAnimationsModule,
        ErrorBarComponent
    ],
    declarations: [
        ErrorBarComponent
    ],
    providers: [
        AppSettingsService,
        LoggerService,
        UserService,
        RE,
        FactionService,
        AppErrorService
    ]
})
export class CoreModule {}