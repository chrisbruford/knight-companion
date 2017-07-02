import { NgModule } from '@angular/core';
import { InterdictionComponent } from './interdiction.component';
import { JournalModule } from '../journal/journal.module';
import { InterdictionService } from './interdiction.service';

@NgModule({
    imports: [JournalModule],
    exports: [InterdictionComponent],
    declarations: [InterdictionComponent],
    providers: [InterdictionService]
})
export class InterdictionModule {}