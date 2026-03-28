import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  oldPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  message = '';
  isSuccess = false;

  constructor(private http: HttpClient) {}

  changePassword() {
    this.message = '';
    this.isSuccess = false;

    if (this.newPassword !== this.confirmNewPassword) {
      this.message = "Les nouveaux mots de passe ne correspondent pas.";
      return;
    }

    const payload = {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    };

    const backendUrl = 'https://alert-aml-admin.onrender.com/api/auth/change-password';

    this.http.put(backendUrl, payload).subscribe({
      next: (response) => {
        this.message = "Mot de passe mis à jour avec succès.";
        this.isSuccess = true;
      },
      error: (error) => {
        this.message = error.error || "Erreur lors de la mise à jour du mot de passe.";
        this.isSuccess = false;
      }
    });
  }
}
