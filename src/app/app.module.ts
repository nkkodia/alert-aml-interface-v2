import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Importez CommonModule
import { PaginatorModule } from 'primeng/paginator'; // Importez le module

import { AppComponent } from './app.component';
import { LoaderComponent } from './loader/loader.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AlertsComponent } from './alerts/alerts.component';
import { AlertDetailModalComponent } from './alert-detail-modal/alert-detail-modal.component';
import { EmailLogsComponent } from './email-logs/email-logs.component';

@NgModule({
  declarations: [

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    AlertDetailModalComponent,
    AlertsComponent,
    EmailLogsComponent,
    DashboardComponent,
    LoaderComponent,
    AppComponent,
    PaginatorModule // Ajoutez le module aux imports

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
