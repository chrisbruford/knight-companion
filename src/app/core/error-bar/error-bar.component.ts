import { Component, Input } from "@angular/core";
import { AppError } from "./app-error.model";
import { AppErrorService } from "../services/app-error.service";

@Component({
    selector: "app-error-bar",
    templateUrl: "error-bar.component.html",
    styleUrls: ["error-bar.component.scss"]
})
export class ErrorBarComponent {
    @Input() errors: AppError[];
    
    constructor(public errorService: AppErrorService) { }

    removeError(title: string) {
        this.errorService.removeError(title);
    }
}