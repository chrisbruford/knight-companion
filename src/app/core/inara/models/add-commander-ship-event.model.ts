import { InaraEvent } from "./inara-event.model";

export class AddCommanderShipEvent extends InaraEvent {
    eventName: 'addCommanderShip';

    constructor(
        public shipType: string, 
        public shipGameID: number
    ) { super() }
}