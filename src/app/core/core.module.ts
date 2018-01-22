import { NgModule } from '@angular/core';
import { AppSettingsService } from './app-settings.service';
import { LoggerService, UserService, RE, FactionService  } from './services';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    imports: [
        BrowserAnimationsModule
    ],
    exports: [
        BrowserAnimationsModule
    ],
    providers: [
        AppSettingsService,
        LoggerService,
        UserService,
        RE,
        FactionService
    ]
})
export class CoreModule {}