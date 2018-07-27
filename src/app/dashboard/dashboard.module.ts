import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { JournalModule } from '../journal/journal.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { MaterialsComponenet } from './materials/materials.component';
import { MaterialsService } from './materials/materials.service';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
    imports: [
        FormsModule,
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
        ShipsComponent,
        MaterialsComponenet,
        SettingsComponent
    ],
    exports: [DashboardComponent],
    providers: [
        CombatService, 
        MissionService,
        ExplorationService,
        ShipsService,
        TrackingFaction,
        MaterialsService
    ]
}) 
export class DashboardModule {}