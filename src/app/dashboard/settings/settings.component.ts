import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { SettingsService } from "./settings.service";
import { AppSetting } from "../../core/enums/app-settings.enum";
import { shell } from "electron";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  public settingsForm: FormGroup;
  public readonly AppSetting = AppSetting;
  private broadcasts = true;
  private inaraBroadcasts = false;
  private inaraAPIKey = "";
  private eddnBroadcasts = true;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    this.settingsForm = this.fb.group({
      broadcasts: [this.broadcasts],
      inaraBroadcasts: [this.inaraBroadcasts],
      inaraAPIKey: [this.inaraAPIKey],
      eddnBroadcasts: [this.eddnBroadcasts],
    });

    let settingPromises = [];

    settingPromises.push(
      this.settingsService
        .getSetting<{ key: string; value: any }>(AppSetting.broadcasts)
        .then((setting) => {
          this.broadcasts = setting ? setting.value : true;
        })
        .catch((err) => {
          console.log(err);
          this.broadcasts = false;
        })
    );

    settingPromises.push(
      this.settingsService
        .getSetting<{ key: string; value: any }>(AppSetting.inaraBroadcasts)
        .then((setting) => {
          this.inaraBroadcasts = setting ? setting.value : false;
        })
        .catch((err) => {
          console.log(err);
          this.inaraBroadcasts = false;
        })
    );

    settingPromises.push(
      this.settingsService
        .getSetting<{ key: string; value: any }>(AppSetting.inaraAPIKey)
        .then((setting) => {
          this.inaraAPIKey = setting ? setting.value : "";
        })
        .catch((err) => {
          console.log(err);
          this.inaraAPIKey = "";
        })
    );

    settingPromises.push(
      this.settingsService
        .getSetting<{ key: string; value: any }>(AppSetting.eddnBroadcasts)
        .then((setting) => {
          this.eddnBroadcasts = setting ? setting.value : true;
        })
        .catch((err) => {
          console.log(err);
          this.eddnBroadcasts = false;
        })
    );

    Promise.all(settingPromises).then(() => {
      this.settingsForm.setValue({
        broadcasts: this.broadcasts,
        inaraBroadcasts: this.inaraBroadcasts,
        inaraAPIKey: this.inaraAPIKey,
        eddnBroadcasts: this.eddnBroadcasts,
      });
    });

    this.settingsForm.get("inaraAPIKey").valueChanges.subscribe((value) => {
      this.settingsService.updateSetting(AppSetting.inaraAPIKey, value);
    });
  }

  slideToggleChange(evt: MatSlideToggleChange, setting: AppSetting): void {
    (this[setting] as any) = evt.checked;
    this.settingsService.updateSetting(setting, evt.checked);
  }

  openExternal(evt: MouseEvent) {
    evt.preventDefault();
    shell.openExternal((<HTMLAnchorElement>evt.target).href);
  }
}
