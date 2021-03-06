import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";
import { CombatComponent } from "./combat/combat.component";
import { ExplorationComponent } from "./exploration/exploration.component";
import { MissionsComponent } from "./missions/missions.component";
import { AuthGuard } from "../core/guards/auth.guard";
import { FleetCarriersComponent } from "./fleet-carriers/fleet-carriers.component";

let routes: Routes = [
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: "combat", component: CombatComponent },
      { path: "exploration", component: ExplorationComponent },
      { path: "missions", component: MissionsComponent },
      { path: "fleet-carriers", component: FleetCarriersComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
