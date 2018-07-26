import { Component } from "@angular/core";
import { ProgressBarService } from "./progress-bar.service";
import { Observable } from "rxjs";
import { tap } from "../../../../node_modules/rxjs/operators";

@Component({
    selector:'app-progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.component.scss']
}) export class KOKProgressBarComponent {
    public progress: Observable<number>;

    public styles = {
        transition: 'opacity 0.5s',
        opacity: '0'
    }

    constructor(progressService: ProgressBarService) {
        this.progress = progressService.progress.pipe(
            tap(progress=>{
                this.styles.opacity = progress > 0 && progress < 100 ? '1':'0';
            })
        );
    }
}