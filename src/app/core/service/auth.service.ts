// src/app/auth.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly CREDENTIALS_KEY = 'authCredentials';

  saveCredentials(creds: string): void {
    localStorage.setItem(this.CREDENTIALS_KEY, creds);
  }

  getCredentials(): string | null {
    return localStorage.getItem(this.CREDENTIALS_KEY);
  }

  clearCredentials(): void {
    localStorage.removeItem(this.CREDENTIALS_KEY);
  }
}
