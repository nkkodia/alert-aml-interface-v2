// src/app/login-registration/login-registration.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../core/service/auth.service';

@Component({
  selector: 'app-login-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-800">
            Connexion
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Entrez vos identifiants pour accéder au tableau de bord.
          </p>
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
            <div class="mt-1">
              <input
                id="username"
                name="username"
                type="text"
                required
                [(ngModel)]="username"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
            <div class="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                required
                [(ngModel)]="password"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
          </div>

          <div *ngIf="errorMessage" class="text-red-500 text-sm text-center font-bold">
            {{ errorMessage }}
          </div>

          <div>
            <button
              type="submit"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Se connecter
            </button>
          </div>
        </form>

        <div class="text-center text-sm text-gray-600">
          <p>Vous n'avez pas de compte ?</p>
          <a routerLink="/register" class="font-medium text-primary hover:text-secondary">
            Créer un compte
          </a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./login-registration.component.css'],
})
export class LoginRegistrationComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  onSubmit() {
    const credentials = btoa(this.username + ':' + this.password);
    const headers = { Authorization: 'Basic ' + credentials };

    this.http.get('https://alert-aml-admin.onrender.com/api/dashboard', { headers, responseType: 'text' }).subscribe(
      (response) => {
        // Sauvegarde les identifiants
        this.authService.saveCredentials(credentials);

        // --- LOGIQUE DE REDIRECTION CORRIGÉE ---
        const redirectUrl = localStorage.getItem('redirectUrl');

        if (redirectUrl) {
          // Naviguer vers l'URL initialement demandée
          localStorage.removeItem('redirectUrl'); // Nettoyer le stockage
          this.router.navigateByUrl(redirectUrl);
        } else {
          // Sinon, naviguer vers le tableau de bord par défaut
          this.router.navigate(['/app/dashboard']);
        }
      },
      (error) => {
        this.errorMessage = 'Identifiants incorrects. Veuillez réessayer.';
        console.error('Erreur de connexion:', error);
      }
    );
  }
}
