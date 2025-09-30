// src/app/auth.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from './service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.authService.getCredentials()) {
      return true; // Accès autorisé
    } else {
      // 1. Sauvegarder l'URL que l'utilisateur tentait d'atteindre
      localStorage.setItem('redirectUrl', state.url);

      // 2. Accès refusé, redirige vers la page de connexion
      this.router.navigate(['/login']);
      return false;
    }
  }
}
