import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";

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

    continents: Observable<string[]> = Observable.of([...this._continents.sort()]);

}