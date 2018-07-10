import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RegisterComponent } from "./register.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { KokMaterialModule } from "../kok-material/kok-material.module";
import { RouterModule } from "@angular/router";

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, KokMaterialModule, RouterModule],
    declarations: [RegisterComponent],
    exports: [RegisterComponent]
}) export class RegisterModule {}