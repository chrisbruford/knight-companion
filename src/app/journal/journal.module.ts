import { NgModule } from '@angular/core';
import { JournalService } from './journal.service';
import { DBService } from '../core/services/db.service';
import { JournalQueueService } from './journalQueue.service';
import { EDDNService } from './eddn.service';

@NgModule({
    imports: [],
    exports: [],
    declarations:[],
    providers: [
        JournalService,
        DBService,
        JournalQueueService,
        EDDNService
    ]
})
export class JournalModule { }