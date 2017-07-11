import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule }  from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { LoginModule } from './login/login.module';

import { AppRoutingModule } from './app-routing.module';
import { MissionsModule } from './missions/missions.module';
import { DashboardModule } from './dashboard/dashboard.module';

import { SharedModule } from './shared/shared.module';

@NgModule({
  imports: [
    BrowserModule,
    LoginModule,
    HttpModule,
    MissionsModule,
    DashboardModule,
    AppRoutingModule,
    SharedModule
  ],
  declarations: [
    AppComponent
  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
