import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { JournalModule } from '../journal/journal.module';
import { FormsModule } from '@angular/forms';
import { MissionsComponent } from './missions/missions.component';
import { InterdictionComponent } from './interdiction/interdiction.component';
import { InterdictionService } from './interdiction/interdiction.service';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        DashboardRoutingModule,
        JournalModule,
        SharedModule
        ],
    declarations: [DashboardComponent, MissionsComponent, InterdictionComponent],
    exports: [DashboardComponent],
    providers: [InterdictionService]
}) 
export class DashboardModule {}