import { NgModule } from '@angular/core';
import { JournalService } from './journal.service';
import { JournalDBService } from './db/journal-db.service';
import { JournalQueueService } from './journalQueue.service';

@NgModule({
    imports: [],
    exports: [],
    declarations:[],
    providers: [
        JournalService,
        JournalDBService,
        JournalQueueService
    ]
})
export class JournalModule { }