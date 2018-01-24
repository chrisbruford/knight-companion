import { Component, Input } from "@angular/core";
import { AppError } from "./app-error.model";

@Component({
    selector: "app-error-bar",
    templateUrl: "error-bar.component.html",
    styleUrls: ["error-bar.component.scss"]
})
export class ErrorBarComponent {
    @Input() errors: AppError[];
    
    constructor() { }
}