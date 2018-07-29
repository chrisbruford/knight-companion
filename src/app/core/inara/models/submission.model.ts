import { InaraEvent } from "./inara-event.model";

export class Submission {
    header: {
        appName: string;
        appVersion: string;
        isDeveloped: boolean;
        APIkey: string;
        commanderName: string;
    }

    events: InaraEvent[]
}