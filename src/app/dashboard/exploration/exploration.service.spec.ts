import { TestBed, async } from '@angular/core/testing';
import { ExplorationService } from './exploration.service';
import { JournalService } from '../../journal/journal.service';
import { EventEmitter } from 'events';
import { JournalEvents, FSDJump } from 'cmdr-journal/dist';

describe('ExplorationService',()=>{
    let explorationService: ExplorationService;
    let mockJournalService = new EventEmitter() as JournalService;

    beforeEach(()=>{
        explorationService = new ExplorationService(mockJournalService);    
    });

    it('should exist',()=>{
        expect(explorationService).toBeDefined();
    });

    it('should start with zero values',()=>{
        let distanceTravelled;
        let jumpsCompleted;
        let avgSpeed;

        explorationService.averageSpeed.subscribe(_avgSpeed=>avgSpeed=_avgSpeed);
        explorationService.distanceTravelled.subscribe(_distanceTravelled=>distanceTravelled=_distanceTravelled);
        explorationService.jumpsCompleted.subscribe(_jumpsCompleted=>jumpsCompleted=_jumpsCompleted);

        expect(distanceTravelled).toEqual(0);
        expect(jumpsCompleted).toEqual(0);
        expect(avgSpeed).toEqual(0);
    });

    it('should increase distance travelled on jump',()=>{
        let fsdJump = new FSDJump();
        let distanceTravelled: number;
        explorationService.distanceTravelled.subscribe(_distanceTravelled=>distanceTravelled=_distanceTravelled);
        
        fsdJump.JumpDist = 5;
        mockJournalService.emit(JournalEvents.fsdJump,fsdJump);
        expect(distanceTravelled).toEqual(5);

        fsdJump.JumpDist = 50;
        mockJournalService.emit(JournalEvents.fsdJump,fsdJump);
        expect(distanceTravelled).toEqual(55);
        
        fsdJump.JumpDist = 500;
        mockJournalService.emit(JournalEvents.fsdJump,fsdJump);
        expect(distanceTravelled).toEqual(555);

        fsdJump.JumpDist = 5000;
        mockJournalService.emit(JournalEvents.fsdJump,fsdJump);
        expect(distanceTravelled).toEqual(5555);

        fsdJump.JumpDist = 50000;
        mockJournalService.emit(JournalEvents.fsdJump,fsdJump);
        expect(distanceTravelled).toEqual(55555);
    });

    it('should increment jumps on each jump',()=>{
        let fsdJump = new FSDJump();
        let jumpsCompleted: number;
        explorationService.jumpsCompleted.subscribe(_jumpsCompleted=>jumpsCompleted=_jumpsCompleted);
        
        mockJournalService.emit(JournalEvents.fsdJump,fsdJump);
        expect(jumpsCompleted).toEqual(1);

        mockJournalService.emit(JournalEvents.fsdJump,fsdJump);
        expect(jumpsCompleted).toEqual(2);
        
        mockJournalService.emit(JournalEvents.fsdJump,fsdJump);
        expect(jumpsCompleted).toEqual(3);
    });

    it('should calculate average travel speed',()=>{
        let fsdJump = new FSDJump();
        let averageSpeed: number;
        fsdJump.JumpDist = 100;

        explorationService.averageSpeed.subscribe(_averageSpeed=>averageSpeed=_averageSpeed);
        
        mockJournalService.emit(JournalEvents.fsdJump,fsdJump);
        mockJournalService.emit(JournalEvents.fsdJump,fsdJump);
        mockJournalService.emit(JournalEvents.fsdJump,fsdJump);

        expect(averageSpeed).toBeGreaterThan(0);
    });
})