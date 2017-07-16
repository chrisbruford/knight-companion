import { NgModule } from '@angular/core';
import { FactionPipe } from './pipes';
import { LoggerService, UserService, RE } from './services';

@NgModule({
    imports: [],
    exports: [FactionPipe],
    declarations: [FactionPipe],
    providers: [
        LoggerService,
        UserService,
        RE
    ],
})
export class SharedModule { }
