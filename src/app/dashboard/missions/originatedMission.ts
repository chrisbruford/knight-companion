import { MissionCompleted } from 'cmdr-journal'

export interface OriginatedMission extends MissionCompleted {
    originator: string;
    localisedName?: string;
}