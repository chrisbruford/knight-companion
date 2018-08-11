import { InaraEvent } from "./models/inara-event.model";
import { MissionCompleted } from "../../../../node_modules/cmdr-journal/dist/models";

export class SetCommanderMissionCompletedEvent extends InaraEvent {
    eventName = "setCommanderMissionCompleted";
    eventData: {
        missionGameID: number;
        donationCredits: number;
        rewardCredits: number;
        rewardPermits: { starsystemName: string }[];
        rewardCommodities: { itemName: string, itemCount: number }[];
        rewardMaterials: { itemName: string, itemCount: number }[];
    }

    constructor(missionCompleted: MissionCompleted) {
        super();

        let permits = [];
        if (missionCompleted.PermitsAwarded) {
            for (let permit of missionCompleted.PermitsAwarded) {
                permits.push({ starsystemName: permit });
            }
        }

        let commodities = [];
        if (missionCompleted.CommodityReward) {
            for (let reward of missionCompleted.CommodityReward) {
                commodities.push({ itemName: reward.Name, itemCount: reward.Count });
            }
        }

        let materials = [];
        if (missionCompleted.MaterialsReward) {
            for (let material of missionCompleted.MaterialsReward) {
                materials.push({ itemName: material.Name, itemCount: material.Count });
            }
        }

        this.eventData = {
            missionGameID: missionCompleted.MissionID,
            donationCredits: missionCompleted.Donation,
            rewardCredits: missionCompleted.Reward,
            rewardPermits: permits,
            rewardCommodities: commodities,
            rewardMaterials: materials
        }
    }
}