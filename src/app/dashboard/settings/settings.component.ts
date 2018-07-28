import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "../../../../node_modules/@angular/forms";
import { MatSlideToggleChange } from "../../../../node_modules/@angular/material";
import { SettingsService } from "./settings.service";

@Component({
    selector:'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
}) export class SettingsComponent implements OnInit {

    public settingsForm: FormGroup;
    private broadcasts: boolean;

    constructor(
        private fb: FormBuilder,
        private settingsService: SettingsService
    ){}

    ngOnInit() {
        this.settingsService.getSetting<boolean>('broadcasts').then(value=>{
            this.broadcasts = value;
        }).catch(err=>{
            console.log(err);
            this.broadcasts = false;
        })

        this.settingsForm = this.fb.group({
            broadcasts: [this.broadcasts]
        });
    }

    slideToggleChange(evt: MatSlideToggleChange, setting: string): void {
        this[setting] = evt.checked;
        this.settingsService.updateSetting(setting,evt.checked);
    }

}