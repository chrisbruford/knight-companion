import { Injectable } from '@angular/core';
import { DBService } from './db.service';
import { Faction } from 'cmdr-journal/dist';
import { LoggerService } from './logger.service';

@Injectable() 
export class FactionService {
    constructor(
        private db: DBService,
        private logger: LoggerService
    ) {}

    getFaction(faction: string | {Name: string} ): Promise<Faction> {
        let factionName: string;

        if (typeof faction === "string") {
            factionName = faction;
        } else {
            factionName = faction.Name;
        }

        return this.db.getEntry<Faction>('factions',factionName);
    }

    getAllFactions(): Promise<Faction[]> {
        return this.db.getAll<Faction>('factions').catch(err=>{
            this.logger.error({
                originalError: err,
                message: "getAllFactions errord"
            });
            return Promise.reject(err);
        })
    }
}