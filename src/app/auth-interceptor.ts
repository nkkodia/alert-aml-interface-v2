// src/app/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const credentials = this.authService.getCredentials();
    if (credentials) {
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Basic ${credentials}`
        }
      });
      return next.handle(authRequest);
    }
    return next.handle(request);
  }
}
