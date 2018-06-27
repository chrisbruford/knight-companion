import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
    //{ path:'**', component: DashboardComponent },
    { path: 'login', component: LoginComponent},
    { path:'', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: '**', component: DashboardComponent, canActivate: [AuthGuard]}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}