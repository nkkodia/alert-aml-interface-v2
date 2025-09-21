import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _credentials: string | null = null;

  saveCredentials(creds: string) {
    this._credentials = creds;
  }

  getCredentials(): string | null {
    return this._credentials;
  }

  clearCredentials(): void {
    this._credentials = null;
  }
}
