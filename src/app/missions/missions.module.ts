import { NgModule } from '@angular/core';
import { CompletedComponent } from './completed/completed.component';
import { MissionsRoutingModule } from './missions-routing.module';

@NgModule({
    imports: [MissionsRoutingModule],
    exports: [CompletedComponent],
    declarations:[CompletedComponent],
    providers:[]
})
export class MissionsModule {}