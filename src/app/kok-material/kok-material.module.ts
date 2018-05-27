import { NgModule } from '@angular/core';
import { MatAutocompleteModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatTabsModule, MatSelectModule, MatOptionModule, MatExpansionModule, MatTableModule, MatSnackBarModule } from '@angular/material';

@NgModule({
    imports: [
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatTabsModule,
        MatSelectModule,
        MatOptionModule,
        MatExpansionModule,
        MatTableModule,
        MatSnackBarModule,
    ],
    exports: [
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatTabsModule,
        MatSelectModule,
        MatOptionModule,
        MatExpansionModule,
        MatTableModule,
        MatSnackBarModule
    ]
})
export class KokMaterialModule {}