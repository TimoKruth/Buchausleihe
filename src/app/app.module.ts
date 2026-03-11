import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {BuecherlisteComponent, NgbdSortableHeader} from './buecherliste/buecherliste.component';
import {FileService} from "./buecherliste/file.service";
import {DB_PROVIDERS} from "./db";
import {SignupComponent} from "./signup/signup.component";
import {MeComponent} from "./me/me.component";
import {FormsModule} from "@angular/forms";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

@NgModule({ declarations: [
        AppComponent,
        BuecherlisteComponent,
        MeComponent,
        SignupComponent,
        NgbdSortableHeader
    ],
    exports: [
        NgbdSortableHeader
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        NgbModule,
        FormsModule], providers: [
        FileService,
        DB_PROVIDERS,
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }
