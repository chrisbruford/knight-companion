import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'toArray',
    pure: false
})
export class ToArrayPipe implements PipeTransform {
    transform<T,U>(input: Map<T, U>): {key: T, value: U}[] {
        let returnArray: {key: T, value: U}[] = [];
        
        input.forEach((inputValue, inputKey)=>{
            returnArray.push({
                key: inputKey,
                value: inputValue
            })
        });
        
        return returnArray;
    }
}