import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { CombatComponent } from './combat/combat.component';
import { ExplorationComponent } from './exploration/exploration.component';
import { MissionsComponent } from './missions/missions.component';

let routes: Routes = [
    {
        path: "dashboard", 
        component: DashboardComponent, 
        children: [
            {path: 'combat', component: CombatComponent},
            {path: 'exploration', component: ExplorationComponent},
            {path: 'missions', component: MissionsComponent}
            
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule { }