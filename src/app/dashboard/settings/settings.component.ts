import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "../../../../node_modules/@angular/forms";
import { MatSlideToggleChange } from "../../../../node_modules/@angular/material";
import { SettingsService } from "./settings.service";
import { AppSetting } from "../../core/enums/app-settings.enum";

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
}) export class SettingsComponent implements OnInit {

    public settingsForm: FormGroup;
    public readonly AppSetting = AppSetting;
    private broadcasts = false;
    private inaraBroadcasts = false;
    private inaraAPIKey = '';

    constructor(
        private fb: FormBuilder,
        private settingsService: SettingsService
    ) { }

    ngOnInit() {
        this.settingsForm = this.fb.group({
            broadcasts: [this.broadcasts],
            inaraBroadcasts: [this.inaraBroadcasts],
            inaraAPIKey: [this.inaraAPIKey]
        });

        let settingPromises = [];

        settingPromises.push(this.settingsService.getSetting<{ key: string, value: any }>(AppSetting.broadcasts)
            .then(setting => {
                this.broadcasts = setting.value;
            })
            .catch(err => {
                console.log(err);
                this.broadcasts = false;
            }));

        settingPromises.push(this.settingsService.getSetting<{ key: string, value: any }>(AppSetting.inaraBroadcasts)
            .then(setting => {
                this.inaraBroadcasts = setting.value;
            })
            .catch(err => {
                console.log(err);
                this.inaraBroadcasts = false;
            }));

        settingPromises.push(this.settingsService.getSetting<{ key: string, value: any }>(AppSetting.inaraAPIKey)
            .then(setting => {
                this.inaraAPIKey = setting.value;
            })
            .catch(err => {
                console.log(err);
                this.inaraAPIKey = '';
            })
        )

        Promise.all(settingPromises).then(() => {
            this.settingsForm.setValue({
                broadcasts: this.broadcasts,
                inaraBroadcasts: this.inaraBroadcasts,
                inaraAPIKey: this.inaraAPIKey
            });
        });

        this.settingsForm.get('inaraAPIKey').valueChanges.subscribe(
            value => {
                this.settingsService.updateSetting(AppSetting.inaraAPIKey, value);
            }
        )

    }

    slideToggleChange(evt: MatSlideToggleChange, setting: string): void {
        this[setting] = evt.checked;
        this.settingsService.updateSetting(setting, evt.checked);
    }

}