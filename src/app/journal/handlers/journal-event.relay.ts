import { Injectable } from "@angular/core";
import { JournalService } from "../journal.service";
import { InaraService } from "../../core/inara/inara.service";
import { JournalEvents, Statistics } from "cmdr-journal/dist";
import { SetCommanderGameStatisticsEvent } from "../../core/inara/models/set-commander-game-statistics-event.model";

@Injectable({
    providedIn: 'root'
})
export class JournalEventRelay {
    constructor(
        private journal: JournalService,
        private inara: InaraService
    ) {
        this.journal.on(JournalEvents.statistics, (statistics: Statistics) => {
            const setCommanderGameStatistics = new SetCommanderGameStatisticsEvent(statistics);
            this.inara.addEvent(setCommanderGameStatistics);
        });
    }
}