import { Component, OnInit, Input } from '@angular/core';
import { JournalService } from '../../journal/journal.service';
import { JournalEvents, JournalEvent, Interdicted, RedeemVoucher, FileHeader } from 'cmdr-journal';
import { Subscription } from 'rxjs';
import { CombatService } from './combat.service';
import { takeWhile } from 'rxjs/operators';
import { TrackingFaction } from '../tracking-faction.service';

@Component({
    styleUrls: ['combat.component.scss'],
    templateUrl: 'combat.component.html',
    selector: 'app-combat'
})
export class CombatComponent implements OnInit {

    private alive = true;
    private combatBondsRedeemed = 0;
    private factionCombatBondsRedeemed = 0;
    private bountyVouchersRedeemed = 0;
    private factionBountyVouchersRedeemed = 0;
    private trackedFaction: string;

    constructor(
        private journalService: JournalService,
        private combatService: CombatService,
        private trackingFaction: TrackingFaction
    ) { }

    ngOnInit() {
        this.combatService.bountyVouchersRedeemed
            .pipe(takeWhile(() => this.alive))
            .subscribe(value => this.bountyVouchersRedeemed = value);

        this.combatService.combatBondsRedeemed
            .pipe(takeWhile(() => this.alive))
            .subscribe(value => this.combatBondsRedeemed = value);

        this.combatService.factionCombatBondsRedeemed
            .pipe(takeWhile(() => this.alive))
            .subscribe(value => this.factionCombatBondsRedeemed = value);

        this.combatService.factionBountyVouchersRedeemed
            .pipe(takeWhile(() => this.alive))
            .subscribe(value => this.factionBountyVouchersRedeemed = value);

        this.trackingFaction.faction
            .pipe(takeWhile(() => this.alive))
            .subscribe(faction => this.trackedFaction = faction);
    }

    ngOnDestroy() {
        this.alive = false;
    }

}