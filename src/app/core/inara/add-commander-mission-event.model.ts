import { InaraEvent } from "./models/inara-event.model";
import { MissionAccepted } from "../../../../node_modules/cmdr-journal/dist";

export class AddCommanderMissionEvent extends InaraEvent {
    eventName = "addCommanderMission";
    eventData: {
        missionName: string;
        missionGameID: number;
        starsystemNameOrigin: string;
        missionExpiry?: string;
        influenceGain?: string;
        reputationGain?: string;
        stationNameOrigin?: string;
        minorfactionNameOrigin?: string;
        starsystemNameTarget?: string;
        stationNameTarget?: string;
        minorfactionNameTarget?: string;
        commodityName?: string;
        commodityCount?: number;
        targetName?: string;
        targetType?: string;
        killCount?: number;
        passengerType?: string;
        passengerCount?: number;
        passengerIsVIP?: boolean;
        passengerIsWanted?: boolean;
    }

    constructor(missionAccepted: MissionAccepted, starsystemNameOrigin: string, stationNameOrigin?: string) {
        super();
        this.eventData = {
            missionName: missionAccepted.Name,
            missionGameID: missionAccepted.MissionID,
            starsystemNameOrigin: starsystemNameOrigin,
            stationNameOrigin: stationNameOrigin,
            minorfactionNameOrigin: missionAccepted.Faction,
            starsystemNameTarget: missionAccepted.DestinationSystem,
            stationNameTarget: missionAccepted.DestinationStation,
            minorfactionNameTarget: missionAccepted.TargetFaction,
            commodityName: missionAccepted.Commodity,
            commodityCount: missionAccepted.Count,
            targetName: missionAccepted.Target,
            targetType: missionAccepted.TargetType,
            killCount: missionAccepted.KillCount,
            passengerType: missionAccepted.PassengerType,
            passengerCount: missionAccepted.PassengerCount,
            passengerIsVIP: missionAccepted.PassengerVIPs,
            passengerIsWanted: missionAccepted.PassengerWanted
        }
    }
}