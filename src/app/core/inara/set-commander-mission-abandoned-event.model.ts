import { InaraEvent } from "./models/inara-event.model";
import { MissionAbandoned } from "../../../../node_modules/cmdr-journal/dist";

export class SetCommanderMissionAbandonedEvent extends InaraEvent {
    eventName = "setCommanderMissionAbandoned";
    eventData: {
        missionGameID: number;
    }
    constructor(missionAbandoned: MissionAbandoned) {
        super();
        this.eventData = {
            missionGameID: missionAbandoned.MissionID
        }
    }
}