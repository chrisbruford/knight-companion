import { NgModule } from '@angular/core';
import { FactionPipe, LightyearPipe } from './pipes';
import { LoggerService, UserService, RE } from './services';

@NgModule({
    imports: [],
    exports: [FactionPipe, LightyearPipe],
    declarations: [FactionPipe, LightyearPipe],
    providers: [
        LoggerService,
        UserService,
        RE
    ],
})
export class SharedModule { }
