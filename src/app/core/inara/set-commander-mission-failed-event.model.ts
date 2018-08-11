import { InaraEvent } from "./models/inara-event.model";
import { MissionFailed } from "../../../../node_modules/cmdr-journal/dist";

export class SetCommanderMissionFailedEvent extends InaraEvent {
    eventName = "setCommanderMissionFailed";
    eventData: {
        missionGameID: number;
    }
    constructor(missionFailed: MissionFailed) {
        super();
        this.eventData = {
            missionGameID: missionFailed.MissionID
        }
    }
}