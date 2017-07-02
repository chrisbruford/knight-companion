import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule }  from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { LoginModule } from './login/login.module';

import { AppRoutingModule } from './app-routing.module';
import { MissionsModule } from './missions/missions.module';
import { DashboardModule } from './dashboard/dashboard.module';

import { RE } from './shared/services/re.service';
import { CommsService } from './shared/services/comms.service';


@NgModule({
  imports: [
    BrowserModule,
    LoginModule,
    HttpModule,
    MissionsModule,
    DashboardModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent
  ],
  providers: [
      RE,
      CommsService
    ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
