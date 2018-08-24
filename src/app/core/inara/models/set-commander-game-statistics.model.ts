import { InaraEvent } from "./inara-event.model";

interface InaraStatistics {
    Bank_Account: {
        Current_Wealth: number;
        Spent_On_Ships: number;
        Spent_On_Outfitting: number;
        Spent_On_Repairs: number;
        Spent_On_Fuel: number;
        Spent_On_Ammo_Consumables: number;
        Insurance_Claims: number;
        Spent_On_Insurance: number;
    };
    Combat: {
        Bounties_Claimed: number;
        Bounty_Hunting_Profit: number;
        Combat_Bonds: number;
        Combat_Bond_Profits: number;
        Assassinations: number;
        Assassination_Profits: number;
        Highest_Single_Reward: number;
        Skimmers_Killed: number;
    };
    Crime: {
        Fines: number;
        Total_Fines: number;
        Bounties_Received: number;
        Total_Bounties: number;
        Highest_Bounty: number;
    };
    Smuggling: {
        Black_Markets_Traded_With: number;
        Black_Markets_Profits: number;
        Resources_Smuggled: number;
        Average_Profit: number;
        Highest_Single_Transaction: number;
    };
    Trading: {
        Markets_Traded_With: number;
        Market_Profits: number;
        Resources_Traded: number;
        Average_Profit: number;
        Highest_Single_Transaction: number;
    };
    Mining: {
        Mining_Profits: number;
        Quantity_Mined: number;
        Materials_Collected: number;
    };
    Exploration: {
        Systems_Visited: number;
        Fuel_Scooped: number;
        Fuel_Purchased: number;
        Exploration_Profits: number;
        Planets_Scanned_To_Level_2: number;
        Planets_Scanned_To_Level_3: number;
        Highest_Payout: number;
        Total_Hyperspace_Distance: number;
        Total_Hyperspace_Jumps: number;
        Greatest_Distance_From_Start: number;
        Time_Played: number;
    };
    Passengers: {
        Passengers_Missions_Bulk: number;
        Passengers_Missions_VIP: number;
        Passengers_Missions_Delivered: number;
        Passengers_Missions_Ejected: number;
    };
    Search_And_Rescue: {
        SearchRescue_Traded: number;
        SearchRescue_Profit: number;
        SearchRescue_Count: number;
    };
    Crafting: {
        Spent_On_Crafting: number;
        Count_Of_Used_Engineers: number;
        Recipes_Generated: number;
        Recipes_Generated_Rank_1: number;
        Recipes_Generated_Rank_2: number;
        Recipes_Generated_Rank_3: number;
        Recipes_Generated_Rank_4: number;
        Recipes_Generated_Rank_5: number;
        Recipes_Applied: number;
        Recipes_Applied_Rank_1: number;
        Recipes_Applied_Rank_2: number;
        Recipes_Applied_Rank_3: number;
        Recipes_Applied_Rank_4: number;
        Recipes_Applied_Rank_5: number;
        Recipes_Applied_On_Previously_Modified_Modules: number;
    };
    Crew: {
        NpcCrew_TotalWages: number;
        NpcCrew_Hired: number;
        NpcCrew_Fired: number;
        NpcCrew_Died: number;
    };
    Multicrew: {
        Multicrew_Time_Total: number;
        Multicrew_Gunner_Time_Total: number;
        Multicrew_Fighter_Time_Total: number;
        Multicrew_Credits_Total: number;
        Multicrew_Fines_Total: number;
    };
}

export class SetCommanderGameStatistics extends InaraEvent {
    eventName = 'setCommanderGameStatistics';
    eventData: InaraStatistics

    constructor(statistics: InaraStatistics) {
        super();
        this.eventData = statistics
    }
}