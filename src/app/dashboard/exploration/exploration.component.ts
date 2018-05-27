import { Component, OnInit } from '@angular/core';
import { ExplorationService } from './exploration.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-exploration',
    templateUrl: './exploration.component.html',
    styleUrls: ['./exploration.component.scss']
})
export class ExplorationComponent implements OnInit {

    constructor(private explorationService: ExplorationService){}

    distanceTravelled: BehaviorSubject<number>;
    averageSpeed: BehaviorSubject<number>;
    jumpsCompleted: BehaviorSubject<number>;

    ngOnInit() {
        this.distanceTravelled = this.explorationService.distanceTravelled;
        this.averageSpeed = this.explorationService.averageSpeed;
        this.jumpsCompleted = this.explorationService.jumpsCompleted;
    }

}