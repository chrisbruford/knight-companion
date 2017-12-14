import { Injectable } from '@angular/core';
import { JournalService } from '../../journal/journal.service';
import { JournalEvents } from 'cmdr-journal/dist/journal-events.enum';
import { FSDJump } from 'cmdr-journal/dist';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class ExplorationService {
    
    distanceTravelled = new BehaviorSubject(0)
    jumpsCompleted = new BehaviorSubject(0);
    averageSpeed = new BehaviorSubject(0);
    
    private _distanceTravelled = 0;
    private _jumpsCompleted = 0;
    private _averageSpeed = 0;
    private firstJumpTime: Date;
    private lastJumpTime: Date;

    constructor(
        private journalService: JournalService
    ) {
        
        this.journalService.on(JournalEvents.fsdJump,(evt:FSDJump)=>{
            this.increaseDistanceTravelled(evt.JumpDist);
        })
    }

    increaseDistanceTravelled(dist: number): void {
        this._distanceTravelled += dist;
        this.jumpsCompleted.next(++this._jumpsCompleted);
        this.distanceTravelled.next(this._distanceTravelled);
        this.lastJumpTime = new Date();
        
        if (!this.firstJumpTime) {
            this.firstJumpTime = this.lastJumpTime;
        }

        if (this.firstJumpTime !== this.lastJumpTime) {
            this._averageSpeed = (this._distanceTravelled/1000) / ((this.lastJumpTime.getTime() - this.firstJumpTime.getTime())/(1000*60*60));
            this.averageSpeed.next(this._averageSpeed);
        }
    }
}