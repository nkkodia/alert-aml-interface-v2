import { Component, OnInit } from '@angular/core';
import { ApiService, AmlAlert, Page } from '../api.service';
import {DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  imports: [
    DatePipe,
    FormsModule
  ],
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit {
  alerts: AmlAlert[] = [];
  currentFilters: any = { page: 0, size: 5, sortBy: 'dateAlerte', sortDir: 'desc' };
  currentPage: number = 0;
  totalPages: number = 1;
  totalElements: number = 0;

  constructor(private apiService: ApiService) { }

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

  openAlertModal(alertId: number): void {
    this.apiService.getAlertDetails(alertId).subscribe({
      next: (alertDetails: AmlAlert) => {
        const modalElement = document.getElementById('alertModal');
        if (modalElement) {
          (document.getElementById('modalAlertId') as HTMLElement).textContent = alertDetails.id.toString();
          (document.getElementById('modalDate') as HTMLElement).textContent = new Date(alertDetails.dateAlerte).toLocaleString();
          (document.getElementById('modalClientName') as HTMLElement).textContent = alertDetails.clientCabinetName;
          (document.getElementById('modalType') as HTMLElement).textContent = alertDetails.typeAlerte;
          (document.getElementById('modalStatusBadge') as HTMLElement).innerHTML = this.getStatusBadgeHtml(alertDetails.statutAlerte);
          (document.getElementById('modalSource') as HTMLElement).textContent = alertDetails.descriptionAlerte;
          (document.getElementById('modalCounterpartyName') as HTMLElement).textContent = alertDetails.nomTiers || alertDetails.denominationSocialeTiers || 'N/A';
          let country = 'N/A';
          if (alertDetails.typeAlerte === 'PaysNonCooperant' && alertDetails.descriptionAlerte) {
            const match = alertDetails.descriptionAlerte.match(/pays non coopérant : (.*?)\./);
            if (match && match[1]) {
              country = match[1];
            }
          }
          (document.getElementById('modalCountry') as HTMLElement).textContent = country;
          (document.getElementById('modalCounterpartyType') as HTMLElement).textContent = 'N/A';
          (document.getElementById('modalMatchReason') as HTMLElement).textContent = alertDetails.descriptionAlerte;
          (document.getElementById('modalReference') as HTMLElement).textContent = alertDetails.tiersIdClientDb;
          const modalAlertHistory = document.getElementById('modalAlertHistory');
          if (modalAlertHistory) {
            modalAlertHistory.innerHTML = `
              <div class="flex items-start">
                  <div class="flex-shrink-0 pt-1"><div class="h-2 w-2 rounded-full bg-gray-400"></div></div>
                  <div class="ml-3">
                      <p class="text-sm text-gray-700">Alert created by system</p>
                      <p class="text-xs text-gray-500">${new Date(alertDetails.dateAlerte).toLocaleString()} by AML System</p>
                  </div>
              </div>
            `;
            if (alertDetails.commentairesTraitement) {
              const commentsHtml = alertDetails.commentairesTraitement.split('\n').map(comment => `
                  <div class="flex items-start">
                      <div class="flex-shrink-0 pt-1"><div class="h-2 w-2 rounded-full bg-blue-400"></div></div>
                      <div class="ml-3">
                          <p class="text-sm text-gray-700">${comment}</p>
                      </div>
                  </div>
              `).join('');
              modalAlertHistory.innerHTML += commentsHtml;
            } else {
              modalAlertHistory.innerHTML += `<p class="text-sm text-gray-500 mt-2">Aucun historique de statut.</p>`;
            }
          }
          const modalComments = document.getElementById('modalComments');
          if (modalComments) {
            modalComments.innerHTML = alertDetails.commentairesTraitement ? `
                <div class="bg-gray-50 p-3 rounded">
                    <div class="flex justify-between">
                        <p class="text-sm font-medium">Historique des commentaires</p>
                        <p class="text-xs text-gray-500">${new Date(alertDetails.dateAlerte).toLocaleString()}</p>
                    </div>
                    <p class="text-sm mt-1">${alertDetails.commentairesTraitement}</p>
                </div>
            ` : '<p class="text-sm text-gray-500">Aucun commentaire.</p>';
          }
          (document.getElementById('newComment') as HTMLTextAreaElement).value = '';
          (document.getElementById('changeStatusSelect') as HTMLSelectElement).value = alertDetails.statutAlerte;
          (document.getElementById('resendRecipientEmail') as HTMLInputElement).value = 'admin@alertaml.com';
          if (modalElement) {
            modalElement.classList.remove('hidden');
          } else {
            console.error("Alert modal element not found.");
          }
        }
      },
      error: (err) => {
        console.error('Failed to load alert details:', err);
        alert('Erreur lors du chargement des détails de l\'alerte.');
      }
    });
  }
}
