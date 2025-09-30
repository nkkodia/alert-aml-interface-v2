import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AmlAlert, ApiService} from '../core/service/api.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-alert-detail-page',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './alert-detail-page.component.html',
  styleUrl: './alert-detail-page.component.css'
})
export class AlertDetailPageComponent  implements OnInit {
  alert: AmlAlert | null = null;
  alertId: number | null = null;
  loading: boolean = true;

  @Output() close = new EventEmitter<void>();
  @Output() alertUpdated = new EventEmitter<void>();
  urlVerification: string = ''; // Nouvelle propriété pour l'édition de l'URL

  selectedFile: File | null = null;

  newComment: string = '';
  selectedStatus: string = '';
  resendRecipientEmail: string = 'admin@alertaml.com';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router, // Injectez le Router

  ) {}

  ngOnInit(): void {
    // Récupère l'ID de l'URL
    this.route.params.subscribe(params => {
      this.alertId = +params['id']; // Le '+' convertit la chaîne en nombre
      if (this.alertId) {
        this.loadAlertDetails(this.alertId);
      }
    });
  }

  isUrlEditable(): boolean {
    if (!this.alert) {
      return false;
    }

    // Rendre le champ éditable pour les types spécifiques où une justification externe est souvent nécessaire
    const editableTypes = ['ListeSanctions', 'PaysNonCooperant', 'RetraitEspèces'];

    // Le champ est éditable si:
    // 1. Le type d'alerte fait partie des types définis
    // OU
    // 2. Une URL a déjà été enregistrée pour cette alerte (même si le type n'est pas dans la liste)
    return editableTypes.includes(this.alert.typeAlerte) || !!this.urlVerification;
  }
  loadAlertDetails(id: number): void {
    this.apiService.getAlertDetails(id).subscribe({
      next: (alertDetails: AmlAlert) => {
        this.alert = alertDetails;
        this.loading = false;
        // Initialiser les valeurs du formulaire ici
      },
      error: (err: any) => {
        console.error('Échec du chargement des détails de l\'alerte:', err);
        this.loading = false;
        this.alert = null;
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

  closeModal(): void {
    this.close.emit();
  }


  saveChanges(): void {
    if (!this.alert || (!this.newComment && !this.selectedStatus && !this.urlVerification)) {
      alert('Veuillez ajouter un commentaire, une URL ou changer le statut.');
      return;
    }

    const formData = new FormData();
    formData.append('newStatus', this.selectedStatus || this.alert.statutAlerte);

    if (this.newComment) {
      formData.append('comments', this.newComment);
    }

    // --- NOUVEAU : Inclure la nouvelle URL de vérification si elle est modifiée ---
    if (this.urlVerification) {
      formData.append('urlVerification', this.urlVerification);
    }

    // ... (logique pour les pièces jointes si elles sont implémentées plus tard) ...

    // 3. Appel de l'API avec FormData
    this.apiService.updateAlertStatusWithFile(this.alert!.id, formData).subscribe({
      next: (updatedAlert) => {
        alert('Alerte mise à jour avec succès !');
        this.loadAlertDetails(this.alert!.id);
        this.newComment = '';
      },
      error: (err) => {
        console.error('Échec de la mise à jour de l\'alerte:', err);
        alert('Erreur lors de la mise à jour de l\'alerte.');
      }
    });
  }

  getVerificationLink(description: string): string | null {
    const match = description.match(/Lien de vérification : (https?:\/\/[^\s]+)/);
    return match ? match[1] : null;
  }

  getSourceText(description: string): string {
    const link = this.getVerificationLink(description);
    return link ? description.replace(new RegExp(`Lien de vérification : ${link}.?`), '') : description;
  }

  getMatchReasonText(description: string): string {
    const link = this.getVerificationLink(description);
    return link ? description.replace(new RegExp(`Lien de vérification : ${link}.?`), '') : description;
  }
  resendEmail(): void {
    if (!this.alert) return;

    if (!this.resendRecipientEmail || !confirm(`Êtes-vous sûr de vouloir renvoyer l'e-mail à ${this.resendRecipientEmail} pour cette alerte ?`)) {
      return;
    }

    const deployedBaseUrl = 'https://alert-aml-interface.netlify.app';
    const alertUrl = `${deployedBaseUrl}/alerts/${this.alert.id}`;

    this.apiService.resendAlertEmail(this.alert.id, this.resendRecipientEmail, alertUrl).subscribe({
      next: (response) => {
        alert('E-mail de renvoi : ' + response);
      },
      error: (err) => {
        console.error('Failed to resend email:', err);
        alert('Erreur lors du renvoi de l\'e-mail.');
      }
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
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

  goBack(): void {
    // Navigue vers la route parente (liste des alertes)
    this.router.navigate(['/app/alerts']);
  }
}
