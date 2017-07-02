export enum JournalEvents {
    //startup
    ClearSavedGame = "ClearSavedGame",
    NewCommander = "NewCommander",
    LoadGame = "LoadGame",
    Progress = "Progress",
    Rank = "Rank",

    //station services
    MissionCompleted = "MissionCompleted",

    //combat
    Bounty = "Bounty",
    CapShipBond = "CapShipBond",
    Died = "Died",
    EscapeInterdiction = "EscapeInterdiction",
    FactionKillBond = "FactionKillBond",
    HeatDamage = "HeatDamage",
    HeatWarning = "HeatWarning",
    HullDamage = "HullDamage",
    Interdicted = "Interdicted",
    Interdiction = "Interdiction",
    PVPKill = "PVPKill",
    ShieldState = "ShieldState"
}