// src/app/main-layout/main-layout.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {AuthService} from '../auth.service';
import {ApiService} from '../api.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class MainLayoutComponent {
  constructor(private authService: AuthService, private router: Router, private apiService: ApiService) {}


  logout(): void {
    // Effacer les identifiants du service et du localStorage
    this.authService.clearCredentials();

    // Rediriger l'utilisateur vers la page de connexion
    this.router.navigate(['/login']);
  }
  triggerScan(): void {
    this.apiService.triggerScan().subscribe({
      next: (response) => alert('Scan déclenché avec succès !'),
      error: (err) => alert('Erreur lors du déclenchement du scan.')
    });
  }
}

