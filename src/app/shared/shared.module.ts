import { NgModule } from '@angular/core';
import { FactionPipe, LightyearPipe } from './pipes';

@NgModule({
    imports: [],
    exports: [FactionPipe, LightyearPipe],
    declarations: [FactionPipe, LightyearPipe],
    providers: [],
})
export class SharedModule { }
