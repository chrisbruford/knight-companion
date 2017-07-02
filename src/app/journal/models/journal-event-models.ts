export class JournalEvent {
    event: string;
    timestamp: string;
}

//model followed by example

//STARTUP
export class NewCommander extends JournalEvent {
    Name: string;
    Package: string;
}

export class LoadGame extends JournalEvent {
    Commander: string;
    Ship: string;
    ShipID: number;
    StartLanded: boolean;
    StartDead: boolean;
    GameMode: string;
    Group: string;
    Credits: number;
    Loan: string;
}

//STATION SERVICES
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
//{ "timestamp":"2016-09-30T08:37:38Z", "event":"MissionCompleted", "Faction":"Maljenni Inc", "Name":"Mission_Delivery_name", "MissionID":65347208, "Commodity":"$Cobalt_Name;", "Commodity_Localised":"Cobalt", "Count":14, "DestinationSystem":"Maljenni", "DestinationStation":"Bowersox Enterprise", "Reward":0, "CommodityReward":[ { "Name": "ArticulationMotors", "Count": 2 } ] }


//COMBAT
export class Interdicted extends JournalEvent {
    Submitted: boolean;
    Interdictor: string;
    IsPlayer: boolean;
    Faction: string;
}
//{ "timestamp":"2016-06-10T14:32:03Z", "event":"Interdicted", "Submitted":false, "Interdictor":"Dread Pirate Roberts", "IsPlayer":false, "Faction": "Timocani Purple Posse"  }

export class Interdiction extends JournalEvent {
    success: boolean;
    Interdicted: string;
    IsPlayer: boolean;
    CombatRank: string;
    Faction: string;
    Power: string;
}
//{ "timestamp":"2016-06-10T14:32:03Z", "event":"Interdiction", "Success":true, "Interdicted":"Fred Flintstone", "IsPlayer":true, "CombatRank":5 }

export class HeatWarning extends JournalEvent {}