// src/app/services/pertimm-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timer, of, throwError } from 'rxjs';
import { switchMap, map, tap, takeWhile, first } from 'rxjs/operators';
import { AuthService } from './auth';

// Interfaces (comme avant)
interface AppRequestResponse { url: string; }
interface StatusResponse { status: string; confirmation_url?: string; }

@Injectable({ providedIn: 'root' })
export class PertimmApiService {
  private apiUrl = 'https://hire-game.pertimm.dev/api/v1.1';
  
  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No auth token available!');
    }
    return new HttpHeaders({ 'Authorization': `Token ${token}` });
  }

  createApplication(userData: { email: string, first_name: string, last_name: string }): Observable<string> {
    const headers = this.getAuthHeaders();
    const url = `${this.apiUrl}/job-application-request/`;
    return this.http.post<AppRequestResponse>(url, userData, { headers }).pipe(
      map(response => response.url)
    );
  }

  pollStatus(statusUrl: string): Observable<StatusResponse> {
    const headers = this.getAuthHeaders();
    // On va poller toutes les 2 secondes jusqu'à obtenir 'COMPLETED'
    return timer(0, 2000).pipe(
      switchMap(() => this.http.get<StatusResponse>(statusUrl, { headers })),
      tap(response => console.log('Polling status:', response.status)),
      // takeWhile s'arrête dès que la condition est fausse.
      // On le modifie pour inclure la dernière émission (COMPLETED).
      takeWhile(response => response.status !== 'COMPLETED', true) 
    );
  }
  
  confirmApplication(confirmationUrl: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(confirmationUrl, { confirmed: true }, { headers });
  }
}