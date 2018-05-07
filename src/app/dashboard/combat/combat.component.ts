import { Component, OnInit, Input } from '@angular/core';
import { JournalService } from '../../journal/journal.service';
import { JournalEvents, JournalEvent, Interdicted, RedeemVoucher, FileHeader } from 'cmdr-journal';
import { Subscription } from 'rxjs';
import { CombatService } from './combat.service';

@Component({
    styleUrls: ['combat.component.scss'],
    templateUrl: 'combat.component.html',
    selector: 'app-combat'
})
export class CombatComponent implements OnInit {

    private cmdrName: string;
    private currentSystem: string;
    private combatBondsRedeemed = 0;
    private factionCombatBondsRedeemed = 0;
    private bountyVouchersRedeemed = 0;
    private factionBountyVouchersRedeemed = 0;
    @Input() trackingFaction: string;

    constructor(
        private journalService: JournalService,
        private combatService: CombatService
    ) { }

    ngOnInit() {
        this.journalService.on(JournalEvents.interdicted, (interdicted: Interdicted) => {
            if (interdicted.IsPlayer) {
                this.interdictedAlert(interdicted);
            }
        });

        this.journalService.on(JournalEvents.fileHeader, (fileHeader: FileHeader)=>{
            if (fileHeader.part === 1) {
                this.combatBondsRedeemed = 0;
            }
        })

        this.journalService.on(JournalEvents.redeemVoucher, (redeemVoucher: RedeemVoucher)=>{
            switch (redeemVoucher.Type) {
                case "CombatBond":
                    this.combatBondsRedeemed += redeemVoucher.Amount;
                    if (redeemVoucher.Faction && redeemVoucher.Faction === this.trackingFaction) {
                        this.factionCombatBondsRedeemed += redeemVoucher.Amount;
                    }
                    break;
                case "bounty":
                    this.bountyVouchersRedeemed += redeemVoucher.Amount;
                    if (redeemVoucher.Factions) {
                        let trackingFactionBounty = redeemVoucher.Factions.find(bounty=>bounty.Faction === this.trackingFaction);
                        if (trackingFactionBounty) {
                            this.factionBountyVouchersRedeemed += trackingFactionBounty.Amount;
                        }
                    }
            }
            this.combatService.bondsAlert(redeemVoucher, this.cmdrName).subscribe(res=>console.log(res));
        })

        this.journalService.currentSystem.subscribe(system => {
            this.currentSystem = system;
        })

        this.journalService.cmdrName.subscribe(name => {
            this.cmdrName = name;
        })
    }

    interdictedAlert(evt: Interdicted): void {
        this.combatService.interdictedAlert(evt, this.cmdrName, this.currentSystem).subscribe(res => console.log(res));
    }

}