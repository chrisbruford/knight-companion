import { InaraEvent } from "./inara-event.model";
import { InaraMaterial } from "./inara-material.model";

export class SetCommanderMaterialsItemEvent extends InaraEvent {
    eventName = "setCommanderInventoryMaterialsItem";

    constructor(public eventData: InaraMaterial) {
        super()
    }
}