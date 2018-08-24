import { Component, OnDestroy } from "@angular/core";
import { MaterialsService } from "../../journal/handlers/materials.service";
import { KOKMaterials } from "./kok-materials.model";
import { takeWhile } from "rxjs/operators";
import { MatTableDataSource, MatTab } from '@angular/material';
import { MaterialCategory } from "./material-category.enum";
import { Material } from "./material.model";

@Component({
    selector: 'app-materials',
    templateUrl: './materials.component.html',
    styleUrls: ['./materials.component.scss']
}) export class MaterialsComponenet implements OnDestroy {

    materials: KOKMaterials;
    materialCategory = MaterialCategory;
    alive: boolean;
    columnsToDisplay: string[];
    rawDataSource: MatTableDataSource<Material>;
    encodedDataSource: MatTableDataSource<Material>;
    manufacturedDataSource: MatTableDataSource<Material>;
    allDataSource: MatTableDataSource<Material>;

    constructor(
        materialsService: MaterialsService
    ) {
        this.alive = true;

        this.rawDataSource = new MatTableDataSource();
        this.encodedDataSource = new MatTableDataSource();
        this.manufacturedDataSource = new MatTableDataSource();
        this.allDataSource = new MatTableDataSource();

        this.materials = {
            raw: new Map(),
            encoded: new Map(),
            manufactured: new Map(),
        };

        this.columnsToDisplay = ['name', 'count']

        materialsService.material$
            .pipe(
                takeWhile(() => this.alive)
            )
            .subscribe(materials => {
                this.materials = materials;
                let rawData = Array.from(this.materials.raw.values())
                let encodedData = Array.from(this.materials.encoded.values())
                let manufacturedData = Array.from(this.materials.manufactured.values())
                this.rawDataSource.data = rawData;
                this.encodedDataSource.data = encodedData;
                this.manufacturedDataSource.data = manufacturedData;
                this.allDataSource.data = rawData.concat(encodedData,manufacturedData);
            });
    }

    applyMaterialFilter(type: MaterialCategory, filterValue: string) {
        filterValue = filterValue.trim();
        filterValue = filterValue.toLowerCase();

        switch (type) {
            case MaterialCategory.encoded:
                this.encodedDataSource.filter = filterValue;
                break;
            case MaterialCategory.raw:
                this.rawDataSource.filter = filterValue;
                break;
            case MaterialCategory.manufactured:
                this.manufacturedDataSource.filter = filterValue;
                break;
            case MaterialCategory.all:
                this.allDataSource.filter = filterValue;
                break;
            default:
                throw new RangeError(`Material type must be one of: ${MaterialCategory.encoded} or ${MaterialCategory.manufactured} or ${MaterialCategory.raw}`);
        }

    }

    ngOnDestroy() {
        this.alive = false;
    }
}