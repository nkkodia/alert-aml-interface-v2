import { Component, OnInit } from '@angular/core';
import {AmlAlert, ApiService} from './api.service';
import {EmailLogsComponent} from './email-logs/email-logs.component';
import {AlertsComponent} from './alerts/alerts.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {LoaderComponent} from './loader/loader.component';
import {AlertDetailModalComponent} from './alert-detail-modal/alert-detail-modal.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    EmailLogsComponent,
    AlertsComponent,
    DashboardComponent,
    AlertDetailModalComponent,
    LoaderComponent,
  ],
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'AML Alert Dashboard';
  activeSection: string = 'dashboard';
  isSidebarOpen: boolean = false;
  selectedAlert: AmlAlert | null = null; // Stocke l'alerte sélectionnée pour la modale

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
  }

  triggerScan(): void {
    if (confirm('Êtes-vous sûr de vouloir déclencher un scan manuel des entités ? Cela peut prendre un certain temps.')) {
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

  // Fonction pour fermer la modale
  onCloseAlertModal(): void {
    this.selectedAlert = null;
  }

  // Fonction appelée quand une alerte est mise à jour
  onAlertUpdated(): void {
    // La modale se ferme et le tableau sera rechargé par le composant AlertsComponent
  }
}
