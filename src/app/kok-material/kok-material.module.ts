import { NgModule } from '@angular/core';
import { MatAutocompleteModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatTabsModule, MatSelectModule, MatOptionModule, MatExpansionModule, MatTableModule, MatSnackBarModule, MatIconModule, MatProgressBarModule, MatSlideToggleModule } from '@angular/material';

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
        MatProgressBarModule,
        MatSlideToggleModule
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
        MatProgressBarModule,
        MatSlideToggleModule
    ]
})
export class KokMaterialModule {}