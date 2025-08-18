import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ApiService, AmlAlert, Page } from '../api.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
      error: (err) => {
        console.error('Failed to load alert details:', err);
        alert('Erreur lors du chargement des détails de l\'alerte.');
      }
    });
  }
}
