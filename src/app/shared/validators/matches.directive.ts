import { AbstractControl, ValidatorFn } from "@angular/forms";

export function MatchesValidator(compareTo: AbstractControl): ValidatorFn {
    return (control: AbstractControl): {[key:string]: any} | null => {
        const matches = control.value === compareTo.value;
        return matches ? null : {'nomatch': {value: control.value, comparedTo: compareTo.value}};
    };
}