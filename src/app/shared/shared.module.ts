import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FactionPipe, LightyearPipe } from './pipes';
import { ToArrayPipe } from './pipes/toArray.pipe';

@NgModule({
    imports: [CommonModule],
    exports: [FactionPipe, LightyearPipe, ToArrayPipe],
    declarations: [FactionPipe, LightyearPipe, ToArrayPipe],
    providers: [DecimalPipe],
})
export class SharedModule { }
