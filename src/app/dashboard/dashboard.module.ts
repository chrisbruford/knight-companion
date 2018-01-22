import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { JournalModule } from '../journal/journal.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MissionsComponent } from './missions/missions.component';
import { InterdictionComponent } from './interdiction/interdiction.component';
import { InterdictionService } from './interdiction/interdiction.service';
import { SharedModule } from '../shared/shared.module';
import { MissionService } from './missions/mission.service';
import { ExplorationComponent } from './exploration/exploration.component';
import { ExplorationService } from './exploration/exploration.service';
import { KokMaterialModule } from '../kok-material/kok-material.module';

@NgModule({
    imports: [
        ReactiveFormsModule,
        CommonModule,
        DashboardRoutingModule,
        JournalModule,
        SharedModule,
        KokMaterialModule
        ],
    declarations: [
        DashboardComponent, 
        MissionsComponent, 
        InterdictionComponent,
        ExplorationComponent
    ],
    exports: [DashboardComponent],
    providers: [
        InterdictionService, 
        MissionService,
        ExplorationService
    ]
}) 
export class DashboardModule {}