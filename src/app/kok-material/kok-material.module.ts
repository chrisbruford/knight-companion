import { NgModule } from '@angular/core';
import { MatAutocompleteModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatTabsModule, MatSelectModule, MatOptionModule } from '@angular/material';

@NgModule({
    imports: [
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatTabsModule,
        MatSelectModule,
        MatOptionModule
    ],
    exports: [
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatTabsModule,
        MatSelectModule,
        MatOptionModule,
    ]
})
export class KokMaterialModule {}