import { NgModule } from '@angular/core';
import { JournalService } from './journal.service';
import { JournalDBService } from './db/journal-db.service';

@NgModule({
    imports: [],
    exports: [],
    declarations:[],
    providers: [
        JournalService,
        JournalDBService
    ]
})
export class JournalModule { }