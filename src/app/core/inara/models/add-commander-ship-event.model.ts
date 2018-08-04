import { InaraEvent } from "./inara-event.model";

export class AddCommanderShipEvent extends InaraEvent {
    eventName = 'addCommanderShip';
    eventData: { 
        shipType: string, 
        shipGameID: number 
    }

    constructor(
        shipType: string, 
        shipGameID: number
    ) { 
        super();
        this.eventData = {
            shipType,
            shipGameID
        }
    }
}