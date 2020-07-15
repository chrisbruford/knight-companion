import { Injectable, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import {
  JournalEvents,
  CarrierJumpRequest,
  CarrierJumpCancelled,
} from "cmdr-journal/dist";
import { LoggerService } from "../../core/services/logger.service";
import { JournalService } from "../../journal/journal.service";
import { BroadcastService } from "../../core/services/broadcast.service";

@Injectable({
  providedIn: "root",
})
export class FleetCarriersService implements OnDestroy {
  private cmdrName: string;
  private destroy = new Subject();

  constructor(
    private journalService: JournalService,
    private http: HttpClient,
    private logger: LoggerService,
    private broadcastService: BroadcastService
  ) {
    this.cmdrName = "Unknown CMDR";

    this.journalService.cmdrName
      .pipe(takeUntil(this.destroy))
      .subscribe((cmdrName) => (this.cmdrName = cmdrName));

    this.journalService.on(
      JournalEvents.carrierJumpRequest,
      (carrierJumpRequest: CarrierJumpRequest) => {
        this.jumpRequest(carrierJumpRequest)
          .pipe(takeUntil(this.destroy))
          .subscribe(
            () => {},
            (originalError) => {
              this.logger.error({
                originalError,
                message: "Carrier Jump Request alert failed",
              });
            }
          );
      }
    );

    this.journalService.on(
      JournalEvents.carrierJumpCancelled,
      (carrierJumpCancelled: CarrierJumpCancelled) => {
        this.jumpCancelled(carrierJumpCancelled)
          .pipe(takeUntil(this.destroy))
          .subscribe(
            () => {},
            (originalError) => {
              this.logger.error({
                originalError,
                message: "Carrier Jump Cancelled alert failed",
              });
            }
          );
      }
    );
  }

  jumpRequest(carrierJumpRequest: CarrierJumpRequest): Observable<boolean> {
    return this.broadcastService.broadcast<boolean>(
      `${process.env.API_ENDPOINT}/fleet-carriers/jump-scheduled`,
      { carrierJumpRequest, cmdrName: this.cmdrName.toLowerCase() }
    );
  }

  jumpCancelled(
    carrierJumpCancelled: CarrierJumpCancelled
  ): Observable<boolean> {
    return this.broadcastService.broadcast<boolean>(
      `${process.env.API_ENDPOINT}/fleet-carriers/jump-cancelled`,
      { carrierJumpCancelled, cmdrName: this.cmdrName.toLowerCase() }
    );
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}
