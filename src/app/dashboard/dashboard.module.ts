import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';

@NgModule({
    imports: [
        CommonModule,
        DashboardRoutingModule
        ],
    declarations: [DashboardComponent],
    exports: [DashboardComponent]
}) 
export class DashboardModule {}