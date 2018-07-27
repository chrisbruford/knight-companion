import { Injectable } from "@angular/core";
import { Docked, FSDJump, Scan, Location } from "cmdr-journal/dist";
import { JournalService } from "./journal.service";
import { HttpClient } from "@angular/common/http";
import { LoggerService } from '../core/services/logger.service';

@Injectable()
export class EDDNService {

    constructor(
        private http: HttpClient,
        private logger: LoggerService
    ) {}

    sendJournalEvent(evt: Docked, cmdrName: string, starPos?: [number,number,number]): void;
    sendJournalEvent(evt: FSDJump, cmdrName: string): void;
    sendJournalEvent(evt: Scan, cmdrName: string, starPos?: [number,number,number], starSystem?: string, systemAddress?:number): void;
    sendJournalEvent(evt: Location, cmdrName: string): void;
    sendJournalEvent(evt: Docked | FSDJump | Scan | Location, cmdrName: string, starPos?: [number,number,number], starSystem?: string, systemAddress?:number): void {

        //clean event because EDDN can't ignore extra props
        if (evt instanceof Docked) {

            if (!starPos) {
                throw new Error("Docked events must be supplied with starPos arguments");
            }

            Object.assign(evt,{
                StarPos: starPos
            });

            delete evt.CockpitBreached;
            delete evt.StationEconomy_Localised;
            delete evt.StationGovernment_Localised;
        } 
        else if  (evt instanceof FSDJump) {
            delete evt.BoostUsed;
            delete evt.FuelLevel;
            delete evt.FuelUsed;
            delete evt.JumpDist;
            delete evt.SystemEconomy_Localised;
            delete evt.SystemGovernment_Localised;
            delete evt.SystemSecondEconomy_Localised;
            delete evt.SystemSecurity_Localised;
        }
        else if  (evt instanceof Scan) {

            if (!starSystem || !starPos || !systemAddress) {
                throw new Error("Scan events must be supplied with starSystem, starPos and systemAddress arguments")
            }

            Object.assign(evt,{
                StarSystem: starSystem,
                StarPos: starPos,
                SystemAddress: systemAddress
            });
        }   
        else if  (evt instanceof Location) {
            delete evt.Latitude;
            delete evt.Longitude;
            delete evt.SystemEconomy_Localised;
            delete evt.SystemGovernment_Localised;
            delete evt.SystemSecondEconomy_Localised;
            delete evt.SystemSecurity_Localised;
        }

        let submission = {
            $schemaRef: process.env.EDDN_JOURNAL_ENDPOINT,
            header: {
                uploaderID: cmdrName,
                softwareName: "Knights of Karma Companion",
                softwareVersion: ""
            },
            message: evt
        }

        this.http.post("https://eddn.edcd.io:4430/upload/",submission, { responseType: 'text' } )
        .subscribe(
            console.log,
            err=>this.logger.error(err)
        );
    }
}