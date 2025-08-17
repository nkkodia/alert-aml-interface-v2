import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { LoaderComponent } from './loader/loader.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AlertsComponent } from './alerts/alerts.component';
import { EmailLogsComponent } from './email-logs/email-logs.component';
import { AlertDetailModalComponent } from './alert-detail-modal/alert-detail-modal.component';
import {RouterModule} from '@angular/router';
import {routes} from './app.routes';

@NgModule({
  declarations: [

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    EmailLogsComponent,
    AlertDetailModalComponent,
    AlertsComponent,
    DashboardComponent,
    LoaderComponent,
    AppComponent,
    RouterModule.forRoot(routes) // Ajoutez le module de routage

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
