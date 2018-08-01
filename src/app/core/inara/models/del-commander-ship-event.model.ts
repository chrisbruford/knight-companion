import { InaraEvent } from "./inara-event.model";

export class DelCommanderShipEvent extends InaraEvent {
    eventName = "delCommanderShip";
    eventData: { shipType: string, shipGameID: number };
    
    constructor(shipType: string, shipGameID: number) {
        super();
        this.eventData = {
            shipType,
            shipGameID
        }
    }

}