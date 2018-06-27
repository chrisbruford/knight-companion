import { NgModule } from "@angular/core";
import { RouterModule, Route } from "@angular/router";
import { ProfileComponent } from "./profile.component";
import { AuthGuard } from "../core/guards/auth.guard";

const ROUTES: Route[] = [
    {
        path: 'account',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        children: [
            { path: 'profile', component: ProfileComponent }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
}) export class AccountRoutingModule { }