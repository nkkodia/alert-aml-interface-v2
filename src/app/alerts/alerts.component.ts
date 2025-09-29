import { Component, OnInit } from '@angular/core';
import { ApiService, AmlAlert, Page } from '../api.service';
import { CommonModule, DatePipe } from '@angular/common'; // Ajout de DatePipe
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import {Router} from '@angular/router'; // Import de la modale

Chart.register(...registerables);

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
  ],
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit {
  alerts: AmlAlert[] = [];
  currentFilters: any = { page: 0, size: 5, sortBy: 'dateAlerte', sortDir: 'desc', typeAlerte: '' };
  currentPage: number = 0;
  totalPages: number = 1;
  totalElements: number = 0;
  selectedAlert: AmlAlert | null = null; // État pour la modale

  alertsByTypeChart: Chart | undefined;
  alertsByStatusChart: Chart | undefined;

  private alertsSubscription: Subscription | undefined;

  constructor(private apiService: ApiService,  private router: Router) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.apiService.getAlerts(this.currentFilters).subscribe({
      next: (page: Page<AmlAlert>) => {
        this.alerts = page.content;
        this.currentPage = page.number;
        this.totalPages = page.totalPages;
        this.totalElements = page.totalElements;
      },
      error: (err: any) => {
        console.error('Failed to load alerts:', err);
        this.alerts = [];
      }
    });
  }

  // Méthode pour ouvrir la modale en chargeant les détails de l'alerte
  onOpenAlertModal(alertId: number): void {
    this.apiService.getAlertDetails(alertId).subscribe({
      next: (alertDetails: AmlAlert) => {
        this.selectedAlert = alertDetails;
      },
      error: (err: any) => {
        console.error('Failed to load alert details:', err);
        alert('Erreur lors du chargement des détails de l\'alerte.');
      }
    });
  }

  // Méthode pour fermer la modale
  onCloseAlertModal(): void {
    this.selectedAlert = null;
  }

  // Méthode pour recharger la liste après une mise à jour de la modale
  onAlertsUpdated(): void {
    this.loadAlerts();
  }

  getStatusBadgeHtml(status: string): string {
    let colorClass = 'bg-gray-100 text-gray-800';
    switch (status) {
      case 'Ouverte': colorClass = 'bg-yellow-100 text-yellow-800'; break;
      case 'En cours de traitement': colorClass = 'bg-blue-100 text-blue-800'; break;
      case 'Fermée - Vrai positif': colorClass = 'bg-green-100 text-green-800'; break;
      case 'Fermée - Faux positif': colorClass = 'bg-gray-100 text-gray-800'; break;
      case 'Sanction': colorClass = 'bg-red-100 text-red-800'; break;
      case 'PEP': colorClass = 'bg-purple-100 text-purple-800'; break;
      case 'PaysNonCooperant': colorClass = 'bg-orange-100 text-orange-800'; break;
      case 'Fermée - Résolu': colorClass = 'bg-green-100 text-green-800'; break;
    }
    return `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}">${status}</span>`;
  }

  sortBy(column: string): void {
    if (this.currentFilters.sortBy === column) {
      this.currentFilters.sortDir = this.currentFilters.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentFilters.sortBy = column;
      this.currentFilters.sortDir = 'desc';
    }
    this.loadAlerts();
  }

  goToPage(page: number): void {
    this.currentFilters.page = page;
    this.loadAlerts();
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.goToPage(this.currentPage + 1);
    }
  }

  getPageNumbers(): number[] {
    const pageNumbers = [];
    for (let i = 0; i < this.totalPages; i++) {
      pageNumbers.push(i + 1);
    }
    return pageNumbers;
  }
  navigateToAlertDetails(alertId: number): void {
    // Utilise le chemin défini dans le routeur : /app/alerts/:id
    this.router.navigate(['/app/alerts', alertId]);
  }
}
