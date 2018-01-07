import { NgModule } from "@angular/core";
import { BrowserModule } from '@angular/platform-browser';
import { TopbarComponent } from "./topbar.component";

@NgModule({
    imports: [
        BrowserModule
    ],
    declarations: [TopbarComponent],
    exports: [TopbarComponent],
    providers: []
})
export class TopbarModule {}