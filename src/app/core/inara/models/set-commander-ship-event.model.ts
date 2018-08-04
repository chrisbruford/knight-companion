import { InaraEvent } from "./inara-event.model";
import { Loadout } from "cmdr-journal";

export class SetCommanderShipEvent extends InaraEvent {
    eventName = "setCommanderShip";
    eventData: {
        shipType: string;
        shipGameID: number;
        shipName: string;
        shipIdent: string;
        isCurrentShip?: boolean;
        isMainShip?: boolean;
        isHot?: boolean;
        shipHullValue?: number;
        shipModulesValue?: number;
        shipRebuyCost?: number;
        starsystemName?: string;
        stationName?: string;
        marketID?: number;
    };

    constructor(loadout: Loadout, starsystemName?: string, stationName?: string, marketID?: number)
    constructor(loadout: Loadout) {
        super();

        this.eventData = {
            shipType: loadout.Ship,
            shipGameID: loadout.ShipID,
            shipName: loadout.ShipName,
            shipIdent: loadout.ShipIdent,
            shipHullValue: loadout.HullValue,
            shipModulesValue: loadout.ModulesValue,
            shipRebuyCost: loadout.Rebuy
        }
    }
}