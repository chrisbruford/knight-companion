import { NgModule } from "@angular/core";
import { ProfileComponent } from "./profile.component";
import { KokMaterialModule } from "../kok-material/kok-material.module";
import { AccountRoutingModule } from "./account-routing.module";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
    declarations: [ProfileComponent],
    exports: [ProfileComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        KokMaterialModule,
        AccountRoutingModule
    ]
})
export class AccountModule { }