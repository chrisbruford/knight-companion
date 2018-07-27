import { MissionCompleted } from 'cmdr-journal/dist'

export interface OriginatedMission extends MissionCompleted {
    originator: string;
    localisedName?: string;
}