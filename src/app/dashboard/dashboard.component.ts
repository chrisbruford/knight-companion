import { Component, OnDestroy, OnInit, NgZone } from "@angular/core";
const fs = require("fs");
import { JournalService } from "../journal/journal.service";
import {
  JournalEvents,
  JournalEvent,
  MissionCompleted,
  LoadGame,
  NewCommander,
} from "cmdr-journal";
import { Observable, combineLatest, of } from "rxjs";
import { map, merge, tap, takeWhile, debounceTime, take } from "rxjs/operators";
import { FactionService } from "../core/services/faction.service";
import { Faction } from "cmdr-journal/dist";
import { LoggerService } from "../core/services/logger.service";
import { FormControl } from "@angular/forms";
import { UserService } from "../core/services/user.service";
import { AppErrorService } from "../core/services/app-error.service";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { TrackingFaction } from "./tracking-faction.service";
import { ProgressBarService } from "../core/progress-bar/progress-bar.service";
import { AppErrorTitle } from "../core/error-bar/app-error-title.enum";
import { InaraService } from "../core/inara/inara.service";
import { ShipsService } from "./ships/ships.service";
import { MaterialsService } from "./materials/materials.service";
import { CombatService } from "./combat/combat.service";
import { ExplorationService } from "./exploration/exploration.service";
import { MissionService } from "./missions/mission.service";
import { SettingsService } from "./settings/settings.service";

@Component({
  templateUrl: "dashboard.component.html",
  styleUrls: ["dashboard.component.scss"],
  selector: "app-dashboard",
})
export class DashboardComponent implements OnDestroy, OnInit {
  missionsCompleted: MissionCompleted[] = [];
  trackingFaction = new FormControl();
  currentSystem: Observable<string>;
  cmdrName: string;
  username: string;
  knownFactions: Faction[];
  filteredKnownFactions: Observable<Faction[]>;
  selectedDashboardTab: number;
  private alive = true;

  constructor(
    public journalService: JournalService,
    public factionService: FactionService,
    public logger: LoggerService,
    public userService: UserService,
    public appErrorService: AppErrorService,
    public trackedFaction: TrackingFaction,
    public progressBar: ProgressBarService,
    private inara: InaraService,
    private zone: NgZone,
    private shipsService: ShipsService,
    private materialsService: MaterialsService,
    private combatService: CombatService,
    private explorationService: ExplorationService,
    private missionService: MissionService,
    private settingsService: SettingsService
  ) {
    this.currentSystem = journalService.currentSystem;
  }

  ngOnInit() {
    this.progressBar.addProgress(this.journalService.initialLoadProgress);

    try {
      this.selectedDashboardTab = Number.parseInt(
        localStorage.getItem("selectedDashboardTab")
      );
    } catch (err) {
      this.logger.error(err);
      this.selectedDashboardTab = 0;
    }

    //username/cmdrname check
    this.journalService.cmdrName
      .pipe(takeWhile(() => this.alive))
      .subscribe((cmdrName) => (this.cmdrName = cmdrName));

    this.userService.user
      .pipe(takeWhile(() => this.alive))
      .subscribe((user) => {
        if (user) {
          this.username = user.username;

          if (!user.discordID || !user.discordID.length) {
            this.appErrorService.addError(AppErrorTitle.noDiscord, {
              message: `️️️️️️️⚠️️️️Your account has not been linked with Discord`,
            });
          } else {
            this.appErrorService.removeError(AppErrorTitle.noDiscord);
          }
        } else {
          this.appErrorService.removeError(AppErrorTitle.noDiscord);
          this.appErrorService.removeError(AppErrorTitle.cmdrUsernameMismatch);
        }
      });

    this.journalService.on("ready", () => {
      combineLatest(
        this.userService.user,
        this.journalService.cmdrName,
        (user, cmdrName) => {
          return { user, cmdrName };
        }
      )
        .pipe(takeWhile(() => this.alive))
        .subscribe(({ user, cmdrName }) => {
          if (user) {
            this.checkNameMismatch(user.username, cmdrName);
          }
        });
    });

    this.trackedFaction.faction.pipe(take(1)).subscribe((faction) => {
      this.trackingFaction.setValue(faction);
      this.trackingFaction.valueChanges
        .pipe(
          debounceTime(500),
          tap((inputValue) => {
            this.trackedFaction.setFaction(inputValue);
          }),
          map((inputValue) => {
            let outputArray = this.knownFactions.filter((faction) => {
              let escapedInputValue = inputValue.replace(
                /[-\/\\^$*+?.()|[\]{}]/g,
                "\\$&"
              );
              let re = new RegExp(`${escapedInputValue}`, "i");
              return re.test(faction.Name);
            });
            return of(outputArray);
          }),
          takeWhile(() => this.alive)
        )
        .subscribe((filteredKnownFactions) => {
          this.filteredKnownFactions = filteredKnownFactions;
        });
    });

    this.factionService
      .getAllFactions()
      .then((factions) => {
        this.knownFactions = factions;
      })
      .catch((err) =>
        this.logger.error({
          originalError: err,
          message: "Error fetching all known factions in dashboard component",
        })
      );
  }

  checkNameMismatch(username: string, cmdrName: string) {
    this.zone.run(() => {
      if (cmdrName.toLowerCase() !== username.toLowerCase()) {
        this.appErrorService.addError(AppErrorTitle.cmdrUsernameMismatch, {
          message: `⚠️️️️You are logged in as ${username.toUpperCase()} but appear to be playing as ${cmdrName.toUpperCase()}`,
        });
      } else {
        this.appErrorService.removeError(AppErrorTitle.cmdrUsernameMismatch);
      }
    });
  }

  doTabChange(e: MatTabChangeEvent) {
    localStorage.setItem("selectedDashboardTab", e.index.toString());
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
