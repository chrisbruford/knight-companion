import { Pipe } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PipeTransform } from '@angular/core/src/change_detection/pipe_transform';
@Pipe({
    name: 'ly'
})
export class LightyearPipe implements PipeTransform {

    constructor(private numberPipe: DecimalPipe) {}

    transform(value: string): string {
        let distance = parseFloat(value);
        if (isNaN(distance)) {return 'Unknown'}

        if (distance < 1000) {
            return `${this.numberPipe.transform(distance, '1.0-0')}ly`
        } else if (distance >= 1000 && distance < 1000000) {
            return `${this.numberPipe.transform(distance / 1000, '1.0-2')}kly`
        } else if (distance >= 1000000) {
            return `${this.numberPipe.transform(distance / 1000000, '1.0-2')}Mly`
        }
    }
}