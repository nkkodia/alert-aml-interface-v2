import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ApiService, AmlAlert, Page } from '../api.service';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-alerts',
  standalone: true, // Ajoutez standalone: true si c'est un composant autonome
  templateUrl: './alerts.component.html',
  imports: [
    DatePipe,
    FormsModule
  ],
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit {
  @Output() openModal = new EventEmitter<AmlAlert>();

  alerts: AmlAlert[] = [];
  currentFilters: any = { page: 0, size: 5, sortBy: 'dateAlerte', sortDir: 'desc' };
  currentPage: number = 0;
  totalPages: number = 1;
  totalElements: number = 0;

  private alertsSubscription: Subscription | undefined;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadAlerts();
  }

  ngOnDestroy(): void {
    if (this.alertsSubscription) {
      this.alertsSubscription.unsubscribe();
    }
  }

  loadAlerts(): void {
    this.alertsSubscription = this.apiService.getAlerts(this.currentFilters).subscribe({
      next: (page: Page<AmlAlert>) => {
        this.alerts = page.content;
        this.currentPage = page.number;
        this.totalPages = page.totalPages;
        this.totalElements = page.totalElements;
      },
      error: (err) => {
        console.error('Failed to load alerts:', err);
        this.alerts = [];
        this.currentPage = 0;
        this.totalPages = 1;
        this.totalElements = 0;
        alert("Erreur lors du chargement des alertes. Voir la console pour plus de détails.");
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
    const maxPagesToShow = 5;
    const startPage = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i + 1);
    }

    if (startPage > 0) {
      pageNumbers.unshift(1, -1); // -1 is a placeholder for "..."
    }
    if (endPage < this.totalPages - 1) {
      pageNumbers.push(-2, this.totalPages); // -2 is a placeholder for "..."
    }
    return pageNumbers;
  }

  openAlertModal(alertId: number): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      this.openModal.emit(alert);
    }
  }
}
