import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";

@Injectable() 
export class PlatformService {

    private _platforms = [
        "PC",
        "Xbox",
        "Playstation"
    ];

    platforms: Observable<string[]> = Observable.of([...this._platforms]);

}