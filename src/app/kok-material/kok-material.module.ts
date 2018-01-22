import { NgModule } from '@angular/core';
import { MatAutocompleteModule, MatFormFieldModule, MatInputModule, MatButtonModule } from '@angular/material';

@NgModule({
    imports: [
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ],
    exports: [
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ]
})
export class KokMaterialModule {}