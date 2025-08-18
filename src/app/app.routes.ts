import { Routes } from '@angular/router';
import { AlertsComponent } from './alerts/alerts.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmailLogsComponent } from './email-logs/email-logs.component';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'alerts', component: AlertsComponent },
  { path: 'email-logs', component: EmailLogsComponent },
  { path: '', redirectTo: '/alerts', pathMatch: 'full' },
  { path: '**', redirectTo: '/alerts' }
];
