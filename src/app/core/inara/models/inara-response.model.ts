import { InaraEventResponse } from "./inara-event-response.model";

export class InaraResponse {
    header: {
        eventStatus: number;
        eventData: {
            userID: number;
            userName: string;
        }
    }

    events: InaraEventResponse[]
}