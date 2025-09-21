import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiService, AmlAlert } from '../api.service';
import {FormsModule} from '@angular/forms';
import {DatePipe, NgIf} from '@angular/common';

@Component({
  selector: 'app-alert-detail-modal',
  templateUrl: './alert-detail-modal.component.html',
  standalone: true, // This is the key
  imports: [
    FormsModule,
    DatePipe
  ],
  styleUrls: ['./alert-detail-modal.component.css']
})
export class AlertDetailModalComponent {
  @Input() alert: AmlAlert | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() alertUpdated = new EventEmitter<void>();

  newComment: string = '';
  selectedStatus: string = '';
  resendRecipientEmail: string = 'admin@alertaml.com';

  constructor(private apiService: ApiService) { }

  ngOnChanges(): void {
    if (this.alert) {
      this.selectedStatus = this.alert.statutAlerte;
      this.newComment = ''; // Clear comment on new alert
    }
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

  closeModal(): void {
    this.close.emit();
  }

  saveChanges(): void {
    if (!this.alert || (!this.newComment && !this.selectedStatus)) {
      alert('Veuillez ajouter un commentaire ou changer le statut.');
      return;
    }

    this.apiService.updateAlertStatus(this.alert.id, this.selectedStatus, this.newComment).subscribe({
      next: (updatedAlert) => {
        alert('Alerte mise à jour avec succès !');
        this.alertUpdated.emit(); // Notifier le parent de la mise à jour
        this.closeModal();
      },
      error: (err) => {
        console.error('Failed to update alert status:', err);
        alert('Erreur lors de la mise à jour de l\'alerte.');
      }
    });
  }

  resendEmail(): void {
    if (!this.alert) return;

    if (!this.resendRecipientEmail || !confirm(`Êtes-vous sûr de vouloir renvoyer l'e-mail à ${this.resendRecipientEmail} pour cette alerte ?`)) {
      return;
    }

    this.apiService.resendAlertEmail(this.alert.id, this.resendRecipientEmail).subscribe({
      next: (response) => {
        alert('E-mail de renvoi : ' + response);
      },
      error: (err) => {
        console.error('Failed to resend email:', err);
        alert('Erreur lors du renvoi de l\'e-mail.');
      }
    });
  }

  getCountryFromDescription(description: string, type: string): string {
    if (type === 'PaysNonCooperant' && description) {
      const match = description.match(/pays non coopérant : (.*?)\./);
      if (match && match[1]) {
        return match[1];
      }
    }
    return 'N/A';
  }
}
