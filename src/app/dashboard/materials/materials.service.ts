import { Injectable } from "@angular/core";
import { JournalService } from "../../journal/journal.service";
import { JournalEvents, JournalEvent, Materials, MissionCompleted } from "cmdr-journal/dist";
import { BehaviorSubject } from "rxjs";
import { KOKMaterials } from "./kok-materials.model";
import { JournalDBService } from "../../journal/db/journal-db.service";
import { Material } from "./material.model";

@Injectable() export class MaterialsService {

    private _materials: KOKMaterials;

    private _material$: BehaviorSubject<KOKMaterials>;

    get material$() {
        return this._material$.asObservable();
    }

    constructor(
        private journal: JournalService,
        private journalDB: JournalDBService
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
                        case "$MICRORESOURCE_CATEGORY_Manufactured;": {
                            let existingMat = this._materials.manufactured.get(material.Name);
                            let updatedMat = Object.assign({},existingMat,material);
                            this._materials.manufactured.set(updatedMat.Name,updatedMat);
                            break;
                        }
                        case "$MICRORESOURCE_CATEGORY_Encoded;": {
                            let existingMat = this._materials.encoded.get(material.Name);
                            let updatedMat = Object.assign({},existingMat,material);
                            this._materials.encoded.set(updatedMat.Name,updatedMat);
                            break;
                        }
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
            console.log('material event');
            materials.Encoded.forEach(material => {
                let updatedMaterial = Object.assign({},this._materials.encoded.get(material.Name),material);
                this._materials.encoded.set(material.Name, updatedMaterial);
            });

            materials.Raw.forEach(material => {
                let updatedMaterial = Object.assign({},this._materials.encoded.get(material.Name),material);
                this._materials.raw.set(material.Name, updatedMaterial);
            });

            materials.Manufactured.forEach(material => {
                let updatedMaterial = Object.assign({},this._materials.encoded.get(material.Name),material);
                this._materials.manufactured.set(material.Name, updatedMaterial);
            });

            this._material$.next(this._materials);
        });

        journal.on('materialUpdated', (material: Material) => {
            console.log('material update event');
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

            this._material$.next(this._materials);
        
        });
    }


}