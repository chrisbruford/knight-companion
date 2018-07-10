import { Pipe, PipeTransform } from '@angular/core';
import { HasFaction } from '../models';

@Pipe({
    name: 'faction',
    pure: false
})

export class FactionPipe implements PipeTransform {
    transform<T extends HasFaction>(events: T[], ...factions: string[]): T[] {
        if (!events || !factions) { return events }

        return events.filter((event:T): boolean => {
            if (!event.Faction) { return false }
            
            for (let faction in factions) {
                if (faction === event.Faction) {
                    return true
                }
            }

            return false
        });
    }
}