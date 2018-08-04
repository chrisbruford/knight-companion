import { InaraEvent } from "./inara-event.model";
import { JournalEvent, JournalEvents, Loadout, DamageType, WeaponMode, ModuleAttribute } from "cmdr-journal";
import { CabinClass } from "../../../../../node_modules/cmdr-journal/dist/enums/cabin-class.enum";

interface EventData {
    shipType: string;
    shipGameID: number;
    shipLoadout: LoadoutItem[];
}

interface Modifier {
    name: ModuleAttribute,
    value: number | DamageType | WeaponMode | CabinClass,
    originalValue?: number | DamageType | WeaponMode | CabinClass,
    lessIsGood?: boolean
}

interface LoadoutItem {
    slotName: string;
    itemName: string;
    itemValue: number;
    itemHealth: number;
    isOn: boolean;
    isHot?: boolean;
    itemPriority: number;
    itemAmmoClip?: number;
    itemAmmoHopper?: number;
    engineering?: {
        blueprintName: string;
        blueprintLevel: number;
        blueprintQuality: number;
        experimentalEffect: string;
        modifiers: Modifier[]
    }
}

export class SetCommanderShipLoadout extends InaraEvent {
    eventName = "setCommanderShipLoadout";
    eventData: EventData;

    constructor(loadout: Loadout) {
        super();

        let eventLoadoutItems: LoadoutItem[] = [];

        for (let prop in loadout.Modules) {
            let module = loadout.Modules[prop];

            let eventLoadoutItem = {
                // TODO: Add isHot handling
                slotName: module.Slot,
                itemName: module.Item,
                itemValue: module.Value,
                itemHealth: module.Health,
                isOn: module.On,
                itemPriority: module.Priority,
                itemAmmoClip: module.AmmoInClip,
                itemAmmoHopper: module.AmmoInHopper,
            }

            if (module.Engineering) {
                eventLoadoutItem['engineering'] = {
                    blueprintName: module.Engineering.BlueprintName,
                    blueprintLevel: module.Engineering.Level,
                    blueprintQuality: module.Engineering.Quality,
                    experimentalEffect: module.Engineering.ExperimentalEffect,
                    modifiers: <Modifier[]>[]
                }

                for (let prop in module.Engineering.Modifiers) {
                    let modifier = module.Engineering.Modifiers[prop];
                    eventLoadoutItem['engineering'].modifiers.push({
                        name: modifier.Label,
                        value: modifier.Value,
                        originalValue: modifier.Value,
                        lessIsGood: modifier.LessIsGood
                    });
                }
            }

            eventLoadoutItems.push(eventLoadoutItem)
        }

        this.eventData = {
            shipType: loadout.Ship,
            shipGameID: loadout.ShipID,
            shipLoadout: eventLoadoutItems
        }
    }
}