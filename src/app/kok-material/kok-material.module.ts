import { NgModule } from '@angular/core';
import { MatAutocompleteModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatTabsModule, MatSelectModule, MatOptionModule, MatExpansionModule, MatTableModule, MatSnackBarModule, MatIconModule, MatProgressBarModule } from '@angular/material';

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
        MatIconModule,
        MatProgressBarModule
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
        MatSnackBarModule,
        MatIconModule,
        MatProgressBarModule
    ]
})
export class KokMaterialModule {}