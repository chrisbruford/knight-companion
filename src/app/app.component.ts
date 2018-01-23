import { Component } from '@angular/core';
import { AppErrorService } from './core/services/app-error.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent { 
    constructor(private appErrorService: AppErrorService) { }
}