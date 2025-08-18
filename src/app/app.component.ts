import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, AmlAlert, Page } from './api.service';
import { AlertsComponent } from './alerts/alerts.component';
import { AlertDetailModalComponent } from './alert-detail-modal/alert-detail-modal.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmailLogsComponent } from './email-logs/email-logs.component';
import {LoaderComponent} from './loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AlertsComponent,
    AlertDetailModalComponent,
    DashboardComponent,
    EmailLogsComponent,
    LoaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'AML Alert Dashboard';
  activeSection: string = 'alerts';
  isSidebarOpen: boolean = false;
  selectedAlert: AmlAlert | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.showSection('alerts');
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  showSection(section: string): void {
    this.activeSection = section;
    this.isSidebarOpen = false;
    this.title = this.getTitleForSection(section);
  }

  getTitleForSection(section: string): string {
    switch (section) {
      case 'dashboard':
        return 'AML Alert Dashboard';
      case 'alerts':
        return 'Alerts Overview';
      case 'emailLogs':
        return 'Email Sending Logs';
      default:
        return 'AML Alert System';
    }
  }

  triggerScan(): void {
    if (confirm('Êtes-vous sûr de vouloir déclencher un scan manuel des entités ?')) {
      this.apiService.triggerScan().subscribe({
        next: (response) => {
          alert(`Scan déclenché avec succès : ${response}`);
          this.showSection('alerts');
        },
        error: (err) => {
          console.error('Erreur lors du déclenchement du scan:', err);
          alert('Erreur lors du déclenchement du scan. Voir la console.');
        }
      });
    }
  }

  onOpenAlertModal(alert: AmlAlert): void {
    this.selectedAlert = alert;
  }

  onCloseAlertModal(): void {
    this.selectedAlert = null;
  }
}
