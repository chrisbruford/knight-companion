import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompletedComponent } from './completed/completed.component';

let routes: Routes = [
    { path: '', children:[
        { path:'completed', component: CompletedComponent }
    ] }
]

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
}) export class MissionsRoutingModule {}