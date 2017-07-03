import { Injectable } from '@angular/core';
import { CommsService } from '../shared/services/comms.service';
import { Interdicted } from '../journal/models/journal-event-models';

@Injectable()
export class InterdictionService {
    constructor(private commsService: CommsService) { }

    interdictedAlert(interdicted: Interdicted,cmdrName: string):void {
            this.commsService.post(`https://www.knightsofkarma.com/api/interdicted/${cmdrName}`,{interdicted})
            .subscribe((res:any)=>{
                console.log(res);
            })
        }
}