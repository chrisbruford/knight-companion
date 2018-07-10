import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from "@angular/common/http";
import { BrowserModule }  from '@angular/platform-browser';
import { CoreModule } from './core/core.module';

import { AppComponent } from './app.component';
import { LoginModule } from './login/login.module';

import { AppRoutingModule } from './app-routing.module';
import { DashboardModule } from './dashboard/dashboard.module';

import { SharedModule } from './shared/shared.module';
import {APP_BASE_HREF} from '@angular/common';
import { AccountModule } from './account/account.module';
import { KokMaterialModule } from './kok-material/kok-material.module';
import { RegisterModule } from './register/register.module';

@NgModule({
  imports: [
    BrowserModule,
    CoreModule,
    LoginModule,
    HttpModule,
    HttpClientModule,
    DashboardModule,
    AccountModule,
    RegisterModule,
    SharedModule,
    KokMaterialModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent
  ],
  providers: [{provide: APP_BASE_HREF, useValue : '/' }],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
