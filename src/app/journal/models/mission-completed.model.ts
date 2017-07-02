import { JournalEvent } from './journal-event.model';

export class MissionCompleted extends JournalEvent {
    Faction: string;
    Name: string;
    MissionID: string;
    Commodity: string;
    Commodity_Localised: string;
    Count: number;
    DestinationSystem: string;
    DestinationStation: string;
    Reward: number;
    CommodityReward: {Name: string, Count: number}[];
}

// let thing: MissionCompleted = {
//     timestamp: "bananas",
//     event: "bananas",
//     Faction: "bananas",
//     Name: "bananas",
//     MissionID: "bananas",
//     Commodity: "bananas",
//     Commodity_Localised: "bananas",
//     Count: 3,
//     DestinationStation: "bananas",
//     DestinationSystem: "bananas",
//     Reward: 3,
//     CommodityReward: [{Name: "Chris", Count: 0}]
// }