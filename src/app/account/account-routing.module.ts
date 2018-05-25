import { NgModule } from "@angular/core";
import { RouterModule, Route } from "@angular/router";
import { ProfileComponent } from "./profile.component";

const ROUTES: Route[] = [
    {path: 'account', children:[
        {path: 'profile', component: ProfileComponent}
    ]}
]

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
}) export class AccountRoutingModule {}