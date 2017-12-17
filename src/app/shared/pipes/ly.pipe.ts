import { Pipe } from '@angular/core';
import { PipeTransform } from '@angular/core/src/change_detection/pipe_transform';
@Pipe({
    name: 'ly'
})
export class LightyearPipe implements PipeTransform {
    transform(value: number) {
        if (value < 1000) {
            return `${value}ly`
        } else if (value > 1000 && value < 1000000) {
            return `${value / 1000}kly`
        } else if (value > 1000000) {
            return `${value / 1000000}Mly`
        }
    }
}