import { Injectable } from "@angular/core";
import {
  Docked,
  FSDJump,
  Scan,
  Location,
  CarrierJump,
  MarketJSON,
  COMMODITY_MAP,
} from "cmdr-journal";
import { HttpClient } from "@angular/common/http";
import { LoggerService } from "../core/services/logger.service";
import { remote } from "electron";
import removeLocalised from "../util/remove-localised";
import { SettingsService } from "../dashboard/settings/settings.service";
import { AppSetting } from "../core/enums/app-settings.enum";
import { filter } from "rxjs/operators";

@Injectable()
export class EDDNService {
  allowBroadcasts: boolean;
  constructor(
    private http: HttpClient,
    private logger: LoggerService,
    public settingService: SettingsService
  ) {
    settingService
      .getSetting<{ key: string; value: any }>(AppSetting.eddnBroadcasts)
      .then(
        (setting) => (this.allowBroadcasts = setting ? setting.value : true)
      );

    settingService.settings
      .pipe(filter((setting) => setting.setting === AppSetting.eddnBroadcasts))
      .subscribe((setting) => (this.allowBroadcasts = setting.value));
  }

  sendJournalEvent(
    evt: Docked,
    cmdrName: string,
    starPos?: [number, number, number]
  ): void;
  sendJournalEvent(evt: FSDJump, cmdrName: string): void;
  sendJournalEvent(
    evt: Scan,
    cmdrName: string,
    starPos?: [number, number, number],
    starSystem?: string,
    systemAddress?: number
  ): void;
  sendJournalEvent(evt: Location, cmdrName: string): void;
  sendJournalEvent(
    evt: Docked | FSDJump | Scan | Location | CarrierJump,
    cmdrName: string,
    starPos?: [number, number, number],
    starSystem?: string,
    systemAddress?: number
  ): void {
    if (this.allowBroadcasts === false) {
      return;
    }
    //clean event because EDDN can't ignore extra props

    if (evt instanceof Docked) {
      if (!starPos) {
        throw new Error(
          "Docked events must be supplied with starPos arguments"
        );
      }

      Object.assign(evt, {
        StarPos: starPos,
      });

      delete evt.CockpitBreach;
      delete evt.ActiveFine;
      delete evt.Wanted;
    } else if (evt instanceof FSDJump) {
      delete evt.BoostUsed;
      delete evt.FuelLevel;
      delete evt.FuelUsed;
      delete evt.JumpDist;
      delete evt.Wanted;

      evt.Factions?.forEach((faction) => {
        delete faction.HappiestSystem;
        delete faction.HomeSystem;
        delete faction.MyReputation;
        delete faction.SquadronFaction;
      });
    } else if (evt instanceof Scan) {
      if (!starSystem || !starPos || !systemAddress) {
        throw new Error(
          "Scan events must be supplied with starSystem, starPos and systemAddress arguments"
        );
      }

      Object.assign(evt, {
        StarSystem: starSystem,
        StarPos: starPos,
        SystemAddress: systemAddress,
      });
    } else if (evt instanceof Location) {
      delete evt.Latitude;
      delete evt.Longitude;
      delete evt.Wanted;
      evt.Factions?.forEach((faction) => {
        delete faction.HappiestSystem;
        delete faction.HomeSystem;
        delete faction.MyReputation;
        delete faction.SquadronFaction;
      });
    }

    let submission = {
      $schemaRef: process.env.EDDN_JOURNAL_ENDPOINT,
      header: {
        uploaderID: cmdrName,
        softwareName: "Knights of Karma Companion",
        softwareVersion: remote.app.getVersion(),
      },
      message: removeLocalised(evt),
    };

    this.http
      .post("https://eddn.edcd.io:4430/upload/", submission, {
        responseType: "text",
      })
      .subscribe(console.log, (err) => this.logger.error(err));
  }

  sendCommodityEvent(marketData: MarketJSON, cmdrName: string) {
    if (this.allowBroadcasts === false) {
      return;
    }
    delete marketData.event;

    const commodityData: EDDNCommodity[] = [];

    marketData.Items.forEach((item) => {
      const commoditySymbol = COMMODITY_MAP.get(item.id)?.symbol;

      if (
        commoditySymbol &&
        !isNaN(item.MeanPrice) &&
        !isNaN(item.BuyPrice) &&
        !isNaN(item.Stock) &&
        !isNaN(item.StockBracket) &&
        !isNaN(item.SellPrice) &&
        !isNaN(item.Demand) &&
        !isNaN(item.DemandBracket)
      ) {
        commodityData.push({
          name: commoditySymbol,
          meanPrice: item.MeanPrice,
          buyPrice: item.BuyPrice,
          stock: item.Stock,
          stockBracket: item.StockBracket,
          sellPrice: item.SellPrice,
          demand: item.Demand,
          demandBracket: item.DemandBracket,
        });
      }
    });

    let submission = {
      $schemaRef: process.env.EDDN_COMMODITY_ENDPOINT,
      header: {
        uploaderID: cmdrName,
        softwareName: "Knights of Karma Companion",
        softwareVersion: remote.app.getVersion(),
      },
      message: {
        systemName: marketData.StarSystem,
        stationName: marketData.StationName,
        marketId: marketData.MarketID,
        timestamp: marketData.timestamp,
        commodities: commodityData,
      },
    };

    this.http
      .post("https://eddn.edcd.io:4430/upload/", submission, {
        responseType: "text",
      })
      .subscribe(console.log, (err) => this.logger.error(err));
  }
}
