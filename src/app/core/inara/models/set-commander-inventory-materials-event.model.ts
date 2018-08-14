import { InaraEvent } from "./inara-event.model";
import { InaraMaterial } from "./inara-material.model";

export class SetCommanderInventoryMaterialsEvent extends InaraEvent {
    eventName = 'setCommanderInventoryMaterials';

    constructor(public eventData: InaraMaterial[]) {
        super();
    }
}