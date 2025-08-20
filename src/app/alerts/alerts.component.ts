import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ApiService, AmlAlert, Page } from '../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables); // Enregistrez tous les modules Chart.js

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit {
  @Output() openModal = new EventEmitter<AmlAlert>();
  alerts: AmlAlert[] = [];
  currentFilters: any = { page: 0, size: 5, sortBy: 'dateAlerte', sortDir: 'desc' };
  currentPage: number = 0;
  totalPages: number = 1;
  totalElements: number = 0;

  alertsByTypeChart: Chart | undefined;
  alertsByStatusChart: Chart | undefined;

  constructor(private apiService: ApiService) {}

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
        this.updateCharts(page.content); // Mettre à jour les graphiques avec les données filtrées
      },
      error: (err: any) => {
        console.error('Failed to load alerts:', err);
        this.alerts = [];
        this.currentPage = 0;
        this.totalPages = 1;
        this.totalElements = 0;
      }
    });
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

  onOpenAlertModal(alertId: number): void {
    this.apiService.getAlertDetails(alertId).subscribe({
      next: (alertDetails: AmlAlert) => {
        this.openModal.emit(alertDetails);
      },
      error: (err: any) => {
        console.error('Failed to load alert details:', err);
        alert('Erreur lors du chargement des détails de l\'alerte.');
      }
    });
  }

  updateCharts(alerts: AmlAlert[]): void {
    const typeCounts: { [key: string]: number } = {};
    const statusCounts: { [key: string]: number } = {};

    alerts.forEach(alert => {
      typeCounts[alert.typeAlerte] = (typeCounts[alert.typeAlerte] || 0) + 1;
      statusCounts[alert.statutAlerte] = (statusCounts[alert.statutAlerte] || 0) + 1;
    });

    const finalTypeLabels = Object.keys(typeCounts).sort();
    const finalStatusLabels = Object.keys(statusCounts).sort();

    const typeColors: { [key: string]: string } = {
      'PaysNonCooperant': '#f97316', // Orange
      'ListeSanctions': '#dc2626',   // Rouge
      'RetraitEspèces': '#1e40af',   // Bleu
      'PEP': '#8b5cf6',              // Violet
      'Other': '#64748b'             // Gris
    };
    const dynamicTypeBackgroundColors = finalTypeLabels.map(label => typeColors[label] || '#64748b');

    const statusColors: { [key: string]: string } = {
      'Ouverte': '#f59e0b',
      'En cours de traitement': '#3b82f6',
      'Fermée - Vrai positif': '#10b981',
      'Fermée - Faux positif': '#64748b',
      'Fermée - Résolu': '#10b981'
    };
    const dynamicStatusBackgroundColors = finalStatusLabels.map(label => statusColors[label] || '#64748b');

    // Mettre à jour le graphique par type
    if (this.alertsByTypeChart) {
      this.alertsByTypeChart.data.labels = finalTypeLabels;
      this.alertsByTypeChart.data.datasets[0].data = finalTypeLabels.map(label => typeCounts[label]);
      this.alertsByTypeChart.data.datasets[0].backgroundColor = dynamicTypeBackgroundColors;
      this.alertsByTypeChart.update();
    } else {
      const ctx = document.getElementById('alertsByTypeChart') as HTMLCanvasElement;
      if (ctx) {
        this.alertsByTypeChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: finalTypeLabels,
            datasets: [{ data: finalTypeLabels.map(label => typeCounts[label]), backgroundColor: dynamicTypeBackgroundColors, borderWidth: 0 }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
        });
      }
    }

    // Mettre à jour le graphique par statut
    if (this.alertsByStatusChart) {
      this.alertsByStatusChart.data.labels = finalStatusLabels;
      this.alertsByStatusChart.data.datasets[0].data = finalStatusLabels.map(label => statusCounts[label]);
      this.alertsByStatusChart.data.datasets[0].backgroundColor = dynamicStatusBackgroundColors;
      this.alertsByStatusChart.update();
    } else {
      const ctx = document.getElementById('alertsByStatusChart') as HTMLCanvasElement;
      if (ctx) {
        this.alertsByStatusChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: finalStatusLabels,
            datasets: [{ label: 'Alerts', data: finalStatusLabels.map(label => statusCounts[label]), backgroundColor: dynamicStatusBackgroundColors, borderWidth: 0 }]
          },
          options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        });
      }
    }
  }
}
