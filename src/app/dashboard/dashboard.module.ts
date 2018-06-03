import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { JournalModule } from '../journal/journal.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MissionsComponent } from './missions/missions.component';
import { CombatComponent } from './combat/combat.component';
import { CombatService } from './combat/combat.service';
import { SharedModule } from '../shared/shared.module';
import { MissionService } from './missions/mission.service';
import { ExplorationComponent } from './exploration/exploration.component';
import { ExplorationService } from './exploration/exploration.service';
import { KokMaterialModule } from '../kok-material/kok-material.module';
import { ShipsComponent } from './ships/ships.component';
import { ShipsService } from './ships/ships.service';
import { TrackingFaction } from './tracking-faction.service';

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
        CombatComponent,
        ExplorationComponent,
        ShipsComponent
    ],
    exports: [DashboardComponent],
    providers: [
        CombatService, 
        MissionService,
        ExplorationService,
        ShipsService,
        TrackingFaction
    ]
}) 
export class DashboardModule {}