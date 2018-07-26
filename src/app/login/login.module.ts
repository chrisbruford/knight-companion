import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { LoginComponent } from './login.component';
import { KokMaterialModule } from '../kok-material/kok-material.module';

@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        RouterModule,
        KokMaterialModule
    ],
    declarations: [
        LoginComponent
    ],
    exports: [
        LoginComponent
    ]
})
export class LoginModule { }