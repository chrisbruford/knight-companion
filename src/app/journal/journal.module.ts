import { NgModule } from '@angular/core';
import { JournalService } from './journal.service';
import { JournalDBService } from './db/journal-db.service';
import { JournalQueueService } from './journalQueue.service';
import { EDDNService } from './eddn.service';

@NgModule({
    imports: [],
    exports: [],
    declarations:[],
    providers: [
        JournalService,
        JournalDBService,
        JournalQueueService,
        EDDNService
    ]
})
export class JournalModule { }