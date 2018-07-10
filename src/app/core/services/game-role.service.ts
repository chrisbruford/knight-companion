import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

@Injectable() 
export class GameRoleService {

    private _gameRole = [
        "Smuggling",
        "Exploring",
        "Bounty Hunting",
        "Pirating",
        "Combat",
        "Mining",
        "Trading",
        "Powerplay"
    ];

    gameRoles: Observable<string[]> = of([...this._gameRole]);

}