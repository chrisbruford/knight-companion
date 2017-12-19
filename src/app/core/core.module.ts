import { NgModule } from '@angular/core';
import { AppSettingsService } from './app-settings.service';
import { LoggerService, UserService, RE } from './services';

@NgModule({
    imports: [],
    exports: [],
    providers: [
        AppSettingsService,
        LoggerService,
        UserService,
        RE
    ]
})
export class CoreModule {}