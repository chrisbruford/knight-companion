import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

@Injectable() 
export class PlatformService {

    private _platforms = [
        "PC",
        "Xbox",
        "Playstation"
    ];

    platforms: Observable<string[]> = of([...this._platforms]);

}