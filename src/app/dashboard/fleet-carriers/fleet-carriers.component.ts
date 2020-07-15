import { Component, OnInit, Input } from "@angular/core";
import { JournalService } from "../../journal/journal.service";
import { Subject } from "rxjs";
import { FleetCarriersService } from "./fleet-carriers.service";
import { TrackingFaction } from "../tracking-faction.service";

@Component({
  styleUrls: ["fleet-carriers.component.scss"],
  templateUrl: "fleet-carriers.component.html",
  selector: "app-carriers",
})
export class FleetCarriersComponent implements OnInit {
  private destroy = new Subject();

  constructor(
    private journalService: JournalService,
    private fleetCarriersService: FleetCarriersService,
    private trackingFaction: TrackingFaction
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}
