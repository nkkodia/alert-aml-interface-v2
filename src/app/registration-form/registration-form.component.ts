// src/app/registration-form/registration-form.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.css']
})
export class RegistrationFormComponent {
  registrationRequest = {
    email: '',
    password: '',
    roles: ['COMPLIANCE'] // Valeur par défaut
  };
  message = '';
  isSuccess = false;

  constructor(private http: HttpClient, private router: Router) { }

  onRegister() {
    const backendUrl = 'https://alert-aml-admin.onrender.com/api/auth/register';

    this.http.post(backendUrl, this.registrationRequest).subscribe({
      next: (response: any) => {
        // La requête a réussi
        this.message = 'Inscription réussie ! Vous pouvez maintenant vous connecter.';
        this.isSuccess = true;
        this.router.navigate(['/login']);
      },
      error: (errorResponse) => {
        // La requête a échoué
        if (errorResponse.error && errorResponse.error.message) {
          // Si le back-end renvoie un message d'erreur
          this.message = `Erreur lors de l’inscription: ${errorResponse.error.message}`;
        } else {
          // Si le back-end ne renvoie pas de message d'erreur structuré
          this.message = 'Erreur lors de l’inscription. Veuillez réessayer.';
        }
        this.isSuccess = false;
        console.error('Erreur lors de l’inscription:', errorResponse);
      }
    });
  }
}
