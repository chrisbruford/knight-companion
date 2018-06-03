import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
export class TrackingFaction {

    private _faction: string;
    private factionSubject: BehaviorSubject<string>;
    
    get faction() {
        return this.factionSubject.asObservable();
    }

    constructor(){
        this._faction = localStorage.getItem("trackingFaction") || "";
        this.factionSubject = new BehaviorSubject<string>(this._faction);
    }

    async setFaction(faction: string) {
        localStorage.setItem("trackingFaction", faction);
        this._faction = faction;
        this.factionSubject.next(this._faction);
    }

}