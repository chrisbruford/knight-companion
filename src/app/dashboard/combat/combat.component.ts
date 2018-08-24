import { Component, OnInit, Input } from '@angular/core';
import { CombatService } from '../../journal/handlers/combat.service';
import { takeWhile } from 'rxjs/operators';
import { TrackingFaction } from '../tracking-faction.service';

@Component({
    styleUrls: ['combat.component.scss'],
    templateUrl: 'combat.component.html',
    selector: 'app-combat'
})
export class CombatComponent implements OnInit {

    private alive = true;
    public combatBondsRedeemed = 0;
    public factionCombatBondsRedeemed = 0;
    public bountyVouchersRedeemed = 0;
    public factionBountyVouchersRedeemed = 0;
    public trackedFaction: string;

    constructor(
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