import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FactionPipe, LightyearPipe } from './pipes';
import { ToArrayPipe } from './pipes/toArray.pipe';
import { UsernameValidator } from './validators/username.directive';
import { KOKEmailValidator } from './validators/email.directive';

@NgModule({
    imports: [CommonModule],
    exports: [FactionPipe, LightyearPipe, ToArrayPipe],
    declarations: [FactionPipe, LightyearPipe, ToArrayPipe],
    providers: [DecimalPipe, UsernameValidator, KOKEmailValidator],
})
export class SharedModule { }
