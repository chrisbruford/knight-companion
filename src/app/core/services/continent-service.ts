import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

@Injectable() 
export class ContinentService {

    private _continents = [
        "North America",
        "South America",
        "Africa",
        "Antarctica",
        "Oceania",
        "Europe",
        "Asia"
    ];

    continents: Observable<string[]> = of([...this._continents.sort()]);

}