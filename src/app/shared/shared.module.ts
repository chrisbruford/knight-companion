import { NgModule } from '@angular/core';
import { FactionPipe, LightyearPipe } from './pipes';
import { ToArrayPipe } from './pipes/toArray.pipe';

@NgModule({
    imports: [],
    exports: [FactionPipe, LightyearPipe, ToArrayPipe],
    declarations: [FactionPipe, LightyearPipe, ToArrayPipe],
    providers: [],
})
export class SharedModule { }
