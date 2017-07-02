import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { JournalModule } from '../journal/journal.module';

@NgModule({
    imports: [
        CommonModule,
        DashboardRoutingModule,
        JournalModule
        ],
    declarations: [DashboardComponent],
    exports: [DashboardComponent]
}) 
export class DashboardModule {}