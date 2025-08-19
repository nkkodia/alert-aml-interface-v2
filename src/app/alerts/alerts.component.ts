import {Component, OnInit, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import { ApiService, AmlAlert, Page } from '../api.service';
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

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  // J'ai renommé la méthode et ajouté l'initialisation de la page à 0
  // pour que la recherche commence toujours au début après avoir changé un filtre.
  applyFiltersAndLoadAlerts(): void {
    this.currentFilters.page = 0; // Réinitialise la page à 0 lors de l'application des filtres
    this.loadAlerts();
  }

  loadAlerts(): void {
    // Crée une copie des filtres pour éviter de modifier l'objet d'origine
    const filtersToSend = { ...this.currentFilters };

    // Supprime les filtres vides pour ne pas les envoyer à l'API
    if (filtersToSend.status === '') {
      delete filtersToSend.status;
    }
    if (filtersToSend.clientId === '') {
      delete filtersToSend.clientId;
    }

    this.apiService.getAlerts(filtersToSend).subscribe({
      next: (page: Page<AmlAlert>) => {
        console.log('API Response Page:', page);
        this.alerts = page.content;
        this.currentPage = page.number;
        this.totalPages = page.totalPages;
        this.totalElements = page.totalElements;
        this.cdr.detectChanges(); // Forcer la détection

      },
      error: (err: any) => {
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

  // --- NOUVELLE LOGIQUE DE PAGINATION AMÉLIORÉE ---
  getPageNumbers(): number[] {
    const pageNumbers: number[] = [];
    const maxPagesToShow = 5; // Nombre maximum de boutons de page à afficher
    let startPage = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);

    // Si le nombre de pages affichées est inférieur à maxPagesToShow,
    // on ajuste le début pour centrer la pagination
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
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
}
