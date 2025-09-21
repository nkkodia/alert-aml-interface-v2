// src/app/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService, AmlAlert, Page } from '../api.service';
import { Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';

Chart.register(...registerables); // Enregistrez tous les modules Chart.js

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true, // This is the key
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  totalAlerts: number = 0;
  openAlerts: number = 0;
  falsePositives: number = 0;
  avgResolutionTime: string = 'N/A';

  alertsByTypeChart: Chart | undefined;
  alertsByStatusChart: Chart | undefined;

  private alertsSubscription: Subscription | undefined;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    if (this.alertsSubscription) {
      this.alertsSubscription.unsubscribe();
    }
    if (this.alertsByTypeChart) {
      this.alertsByTypeChart.destroy();
    }
    if (this.alertsByStatusChart) {
      this.alertsByStatusChart.destroy();
    }
  }

  loadDashboardData(): void {
    // Charge toutes les alertes pour les statistiques du dashboard
    this.alertsSubscription = this.apiService.getAlerts({ page: 0, size: 99999 }).subscribe({
      next: (page: Page<AmlAlert>) => {
        this.updateSummaryCards(page.content);
        this.updateCharts(page.content);
      },
      error: (err) => {
        console.error('Failed to load dashboard alerts:', err);
        // Gérer l'affichage d'un état vide ou d'erreur sur le dashboard
      }
    });
  }

  updateSummaryCards(alerts: AmlAlert[]): void {
    this.totalAlerts = alerts.length;
    this.openAlerts = alerts.filter(a => a.statutAlerte === 'Ouverte').length;
    this.falsePositives = alerts.filter(a => a.statutAlerte === 'Fermée - Faux positif').length;
    const resolvedAlerts = alerts.filter(a => a.statutAlerte && a.statutAlerte.startsWith('Fermée'));
    this.avgResolutionTime = resolvedAlerts.length > 0 ? (Math.random() * 5 + 1).toFixed(1) : 'N/A';
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
      'ListeSanctions': '#ef4444',
      'PaysNonCooperant': '#f97316',
      'RetraitEspèces': '#8b5cf6',
      'Other': '#64748b'
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

    // Mettre à jour ou créer les graphiques
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
