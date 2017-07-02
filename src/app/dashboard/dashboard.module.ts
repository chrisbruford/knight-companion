import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { JournalModule } from '../journal/journal.module';
import { FormsModule } from '@angular/forms';
import { InterdictionModule } from '../interdiction/interdiction.module';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        DashboardRoutingModule,
        JournalModule,
        InterdictionModule
        ],
    declarations: [DashboardComponent],
    exports: [DashboardComponent]
}) 
export class DashboardModule {}