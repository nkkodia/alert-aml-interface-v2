import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

export interface CommentaireAlerte {
  id: number;
  texte: string;
  nomUtilisateur: string;
  roleUtilisateur: string;
  dateCommentaire: string;
  pieceJointeUrl: string | null;
}

export interface AmlAlert {
  id: number;
  tiersIdClientDb: string;
  clientCabinetName: string;
  nomTiers: string;
  prenomTiers: string;
  denominationSocialeTiers: string;
  typeAlerte: string;
  descriptionAlerte: string;
  dateAlerte: string;
  statutAlerte: string;
  idSanctionReference: number;
  notes: string;
  gradeEnCharge: string;
  bloquant: boolean;
  urlVerification?: string;
  commentairesTraitement: string;
  historiqueCommentaires: CommentaireAlerte[];

}

export interface SentEmailLog {
  id: number;
  recipientEmail: string;
  subject: string;
  bodyPreview: string;
  sentAt: string;
  status: string;
  errorMessage: string;
}

export interface Page<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: {
    paged: boolean;
    unpaged: boolean;
    pageNumber: number;
    pageSize: number;
    offset: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
  };
  size: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  totalElements: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private API_BASE_URL = 'https://alert-aml-admin.onrender.com';

  constructor(private http: HttpClient) { }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.error.message}`;
      }
    }
    alert(`API Error: ${errorMessage}`);
    return throwError(() => new Error(errorMessage));
  }

  getAlerts(filters: any): Observable<Page<AmlAlert>> {
    let params = new HttpParams();
    for (const key in filters) {
      if (filters.hasOwnProperty(key) && filters[key] !== null && filters[key] !== '') {
        params = params.append(key, filters[key]);
      }
    }
    return this.http.get<Page<AmlAlert>>(`${this.API_BASE_URL}/api/alerts`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getAlertDetails(alertId: number): Observable<AmlAlert> {
    return this.http.get<AmlAlert>(`${this.API_BASE_URL}/api/alerts/${alertId}`).pipe(
      catchError(this.handleError)
    );
  }

  updateAlertStatus(alertId: number, newStatus: string, comments: string): Observable<AmlAlert> {
    const body = { newStatus, comments };
    return this.http.put<AmlAlert>(`${this.API_BASE_URL}/api/alerts/${alertId}/status`, body).pipe(
      catchError(this.handleError)
    );
  }

  // Nouvelle fonction pour renvoyer un e-mail avec l'URL de l'alerte
  resendAlertEmail(alertId: number, recipientEmail: string, alertUrl: string): Observable<string> {
    const body = { recipientEmail, alertUrl }; // L'URL est envoyée dans le corps de la requête
    return this.http.post<string>(`${this.API_BASE_URL}/api/alerts/${alertId}/resend-email`, body, { responseType: 'text' as 'json' });
  }

  triggerScan(): Observable<string> {
    return this.http.post(`${this.API_BASE_URL}/api/admin/trigger-scan`, {}, { responseType: 'text' }).pipe(
      catchError(this.handleError)
    );
  }

  getEmailLogs(filters: any): Observable<Page<SentEmailLog>> {
    let params = new HttpParams();
    for (const key in filters) {
      if (filters.hasOwnProperty(key) && filters[key] !== null && filters[key] !== '') {
        params = params.append(key, filters[key]);
      }
    }
    return this.http.get<Page<SentEmailLog>>(`${this.API_BASE_URL}/api/email-logs`, { params }).pipe(
      catchError(this.handleError)
    );
  }
  updateAlertStatusWithFile(alertId: number, formData: FormData): Observable<AmlAlert> {
    // Use a PUT request with the FormData object
    return this.http.put<AmlAlert>(`${this.API_BASE_URL}/api/alerts/${alertId}/status`, formData);
  }
}
