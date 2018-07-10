import { LightyearPipe } from './ly.pipe';
import { DecimalPipe } from '@angular/common';

let numberPipe = new DecimalPipe(`en-UK`);

describe('ly pipe',()=>{
    let pipe: LightyearPipe;

    beforeEach(()=>{
        pipe = new LightyearPipe(numberPipe);
    });


    it('should exist',()=>{
        expect(pipe).toBeDefined();
    });

    it('should transform a number below into a formatted ly string',()=>{
        //<1kly should be shown to whole ly
        //>1kly shuld be shown to up to 2dp 
        expect(pipe.transform('900')).toBe('900ly');
        expect(pipe.transform('1000')).toBe('1kly');
        expect(pipe.transform('1100')).toBe('1.1kly');
        expect(pipe.transform('999000')).toBe('999kly');
        expect(pipe.transform('1000000')).toBe('1Mly');
        expect(pipe.transform('1110000')).toBe('1.11Mly');
    });
})