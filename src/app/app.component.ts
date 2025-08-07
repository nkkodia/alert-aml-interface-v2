import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import {EmailLogsComponent} from './email-logs/email-logs.component';
import {AlertsComponent} from './alerts/alerts.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {LoaderComponent} from './loader/loader.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    EmailLogsComponent,
    AlertsComponent,
    DashboardComponent,
    LoaderComponent
  ],
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'AML Alert Dashboard';
  activeSection: string = 'dashboard';
  isSidebarOpen: boolean = false;

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
}
