import { Injectable } from "@angular/core";
import { JournalService } from "../journal.service";
import { JournalEvents, Materials } from "cmdr-journal/dist";
import { BehaviorSubject } from "rxjs";
import { KOKMaterials } from "../../dashboard/materials/kok-materials.model";
import { DBService } from "../../core/services/db.service";
import { Material } from "../../dashboard/materials/material.model";
import { KOKJournalEvents } from '../kok-journal-events.enum';
import { InaraService } from "../../core/inara/inara.service";
import { InaraMaterial } from "../../core/inara/models/inara-material.model";
import { SetCommanderInventoryMaterialsEvent } from "../../core/inara/models/set-commander-inventory-materials-event.model";
import { SetCommanderMaterialsItemEvent } from "../../core/inara/models/set-commander-materials-item-event.model";

@Injectable({
    providedIn: 'root'
}) export class MaterialsService {

    private _materials: KOKMaterials;

    private _material$: BehaviorSubject<KOKMaterials>;

    get material$() {
        return this._material$.asObservable();
    }

    constructor(
        private journal: JournalService,
        private journalDB: DBService,
        private inaraService: InaraService
    ) {

        this._materials = {
            raw: new Map(),
            manufactured: new Map(),
            encoded: new Map()
        };

        this._material$ = new BehaviorSubject<KOKMaterials>(this._materials);

        this.journalDB.getAll<Material>('materials')
            .then(materials=>{
                for (let material of materials) {
                    switch (material.Category) {
                        case "Manufactured":
                        case "$MICRORESOURCE_CATEGORY_Manufactured;": {
                            let existingMat = this._materials.manufactured.get(material.Name);
                            let updatedMat = Object.assign({},existingMat,material);
                            this._materials.manufactured.set(updatedMat.Name,updatedMat);
                            break;
                        }
                        case "Encoded":
                        case "$MICRORESOURCE_CATEGORY_Encoded;": {
                            let existingMat = this._materials.encoded.get(material.Name);
                            let updatedMat = Object.assign({},existingMat,material);
                            this._materials.encoded.set(updatedMat.Name,updatedMat);
                            break;
                        }
                        case "Raw":
                        case "$MICRORESOURCE_CATEGORY_Elements;": {
                            let existingMat = this._materials.raw.get(material.Name);
                            let updatedMat = Object.assign({},existingMat,material);
                            this._materials.raw.set(updatedMat.Name,updatedMat);
                            break;
                        }
                    }
                }

                this._material$.next(this._materials);
            })
            .catch()

        journal.on(JournalEvents.materials, (materials: Materials) => {
            let inaraMaterials: InaraMaterial[] = [];

            materials.Encoded.forEach(material => {
                let updatedMaterial = Object.assign({},this._materials.encoded.get(material.Name),material);
                this._materials.encoded.set(material.Name, updatedMaterial);
                inaraMaterials.push({itemCount: updatedMaterial.Count, itemName: updatedMaterial.Name});
            });

            materials.Raw.forEach(material => {
                let updatedMaterial = Object.assign({},this._materials.encoded.get(material.Name),material);
                this._materials.raw.set(material.Name, updatedMaterial);
                inaraMaterials.push({itemCount: updatedMaterial.Count, itemName: updatedMaterial.Name});
            });

            materials.Manufactured.forEach(material => {
                let updatedMaterial = Object.assign({},this._materials.encoded.get(material.Name),material);
                this._materials.manufactured.set(material.Name, updatedMaterial);
                inaraMaterials.push({itemCount: updatedMaterial.Count, itemName: updatedMaterial.Name});
            });

            let setCommanderInventoryMaterialsEvent = new SetCommanderInventoryMaterialsEvent(inaraMaterials);
            this.inaraService.addEvent(setCommanderInventoryMaterialsEvent);
            this._material$.next(this._materials);
        });

        journal.on(KOKJournalEvents.materialUpdate, (material: Material) => {
            switch (material.Category) {
                case "Manufactured":
                case "$MICRORESOURCE_CATEGORY_Manufactured;": {
                    this._materials.manufactured.set(material.Name, material);
                    break;
                }
                case "Encoded":
                case "$MICRORESOURCE_CATEGORY_Encoded;": {
                    this._materials.encoded.set(material.Name, material);
                    break;
                }
                case "Raw":
                case "$MICRORESOURCE_CATEGORY_Elements;": {
                    this._materials.raw.set(material.Name, material);
                    break;
                }
            }

            let setCommanderMaterialsItemEvent = new SetCommanderMaterialsItemEvent({
                itemName: material.Name,
                itemCount: material.Count
            })
            this.inaraService.addEvent(setCommanderMaterialsItemEvent);
            this._material$.next(this._materials);
        });
    }


}