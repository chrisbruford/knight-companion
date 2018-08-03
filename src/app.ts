require("./assets/scss/app.scss");

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './app/app.module';
import './material-theme.scss';

window['eval'] = global.eval = function () {
    throw new Error(`Sorry, this app does not support window.eval().`)
}

if (process.env.ENV === 'production') {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);