import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, takeWhile } from 'rxjs/operators';
import { Interdicted, RedeemVoucher, JournalEvents, FileHeader } from 'cmdr-journal';
import { LoggerService } from '../../core/services/logger.service';
import { JournalService } from '../../journal/journal.service';
import { TrackingFaction } from '../tracking-faction.service';

@Injectable()
export class CombatService implements OnDestroy {

    private _combatBondsRedeemed: number;
    private combatBondsRedeemedSubject: BehaviorSubject<number>;
    get combatBondsRedeemed() {
        return this.combatBondsRedeemedSubject.asObservable();
    }
    
    private _factionCombatBondsRedeemed = 0;
    private factionCombatBondsRedeemedSubject: BehaviorSubject<number>;
    get factionCombatBondsRedeemed() {
        return this.factionCombatBondsRedeemedSubject.asObservable();
    }

    private _bountyVouchersRedeemed: number;
    private bountyVouchersRedeemedSubject: BehaviorSubject<number>;
    get bountyVouchersRedeemed() {
        return this.bountyVouchersRedeemedSubject.asObservable();
    }

    private _factionBountyVouchersRedeemed = 0;
    private factionBountyVouchersRedeemedSubject: BehaviorSubject<number>;
    get factionBountyVouchersRedeemed() {
        return this.factionBountyVouchersRedeemedSubject.asObservable();
    }

    private trackedFaction: string;
    private cmdrName: string;
    private currentSystem: string;
    private alive: boolean;

    

    constructor(
        private journalService: JournalService,
        private http: HttpClient,
        private logger: LoggerService,
        private trackingFaction: TrackingFaction
    ) {

        this._combatBondsRedeemed = 0;
        this._bountyVouchersRedeemed = 0;
        this.cmdrName = "Unknown CMDR";
        this.alive = true;

        this.combatBondsRedeemedSubject = new BehaviorSubject(0);
        this.bountyVouchersRedeemedSubject = new BehaviorSubject(0);
        this.factionBountyVouchersRedeemedSubject = new BehaviorSubject(0);
        this.factionCombatBondsRedeemedSubject = new BehaviorSubject(0);

        this.trackingFaction.faction.subscribe(faction=>this.trackedFaction=faction);

        this.journalService.cmdrName
            .pipe(
                takeWhile(() => this.alive)
            )
            .subscribe(cmdrName => this.cmdrName = cmdrName);

        this.journalService.currentSystem
            .pipe(
                takeWhile(() => this.alive)
            )
            .subscribe(currentSystem => this.currentSystem = currentSystem);

        this.journalService.on(JournalEvents.redeemVoucher, (redeemVoucher: RedeemVoucher) => {

            switch (redeemVoucher.Type) {
                case "CombatBond":
                    this._combatBondsRedeemed += redeemVoucher.Amount;
                    this.combatBondsRedeemedSubject.next(this._combatBondsRedeemed);

                    if (redeemVoucher.Faction === this.trackedFaction) {
                        this._factionCombatBondsRedeemed += redeemVoucher.Amount;
                        this.factionCombatBondsRedeemedSubject.next(this._factionCombatBondsRedeemed);
                    }
                    
                    break;
                
                    case "bounty":
                    this._bountyVouchersRedeemed += redeemVoucher.Amount;
                    this.bountyVouchersRedeemedSubject.next(this._bountyVouchersRedeemed);
                    
                    if (redeemVoucher.Factions) {
                        let trackingFactionBounty = redeemVoucher.Factions.find(bounty => bounty.Faction === this.trackedFaction);
                        if (trackingFactionBounty) {
                            this._factionBountyVouchersRedeemed += trackingFactionBounty.Amount;
                            this.factionBountyVouchersRedeemedSubject.next(this._factionBountyVouchersRedeemed);
                        }
                    }
            }
            this.bondsAlert(redeemVoucher)
                .pipe(
                    takeWhile(() => this.alive)
                )
                .subscribe(
                    () => { },
                    originalError => {
                        this.logger.error({ originalError, message: "Bonds alert failed" })
                    }
                );
        });

        this.journalService.on(JournalEvents.interdicted, (interdicted: Interdicted) => {
            if (interdicted.IsPlayer) {
                this.interdictedAlert(interdicted)
                    .subscribe(
                        () => { },
                        originalError => {
                            this.logger.error({ originalError, message: "Interdiction alert failed" })
                        }
                    )
            }
        });

        this.journalService.on(JournalEvents.fileHeader, (fileHeader: FileHeader) => {
            if (fileHeader.part === 1) {
                this._combatBondsRedeemed = 0;
            }
        })
    }

    interdictedAlert(interdicted: Interdicted): Observable<boolean> {
        return this.http.post<boolean>(`${process.env.API_ENDPOINT}/combat/interdicted/${this.cmdrName.toLowerCase()}`, { interdicted, system: this.currentSystem })
    }

    bondsAlert(redeemVoucher: RedeemVoucher): Observable<boolean> {
        return this.http.post<boolean>(`${process.env.API_ENDPOINT}/combat/redeemVoucher`, { redeemVoucher, cmdrName: this.cmdrName.toLowerCase() })
    }

    ngOnDestroy() {
        this.alive = false;
    }
}