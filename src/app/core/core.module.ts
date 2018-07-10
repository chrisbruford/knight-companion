import { NgModule } from '@angular/core';
import { AppSettingsService } from './app-settings.service';
import { LoggerService, UserService, RE, FactionService, ContinentService, PlatformService  } from './services';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppErrorService } from './services/app-error.service';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorBarComponent } from './error-bar/error-bar.component';
import { SharedModule } from '../shared/shared.module';
import { AuthGuard } from './guards/auth.guard';
import { GameRoleService } from './services/game-role.service';

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
        AppErrorService,
        ContinentService,
        PlatformService,
        GameRoleService,
        AuthGuard
    ]
})
export class CoreModule {}