import { Routes } from '@angular/router';

// Composants non authentifiés (standalone)
import { LoginRegistrationComponent } from './login-registration/login-registration.component';
import { RegistrationFormComponent } from './registration-form/registration-form.component';

// Composants authentifiés (standalone)
import { AlertsComponent } from './alerts/alerts.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import {ChangePasswordComponent} from './change-password/change-password.component';
import {EmailLogsComponent} from './email-logs/email-logs.component';
import {AlertDetailPageComponent} from './alert-detail-page/alert-detail-page.component';
import {AuthGuard} from './core/auth.guard';

export const routes: Routes = [
  // Redirection par défaut vers la page de connexion
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginRegistrationComponent },
  { path: 'register', component: RegistrationFormComponent },

  // Routes protégées avec le layout principal
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [AuthGuard], // <-- AJOUT DE LA GARDE ICI
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Add a default child route
      { path: 'alerts', component: AlertsComponent },
      { path: 'alerts/:id', component: AlertDetailPageComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'email-logs', component: EmailLogsComponent }, // Ajoutez la route


    ],
  },

  // Redirige toute URL inconnue vers la page de connexion
  { path: '**', redirectTo: 'login' }
];
