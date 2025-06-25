// src/app/services/pertimm-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timer, of, throwError } from 'rxjs';
import { switchMap, map, tap, takeWhile, first } from 'rxjs/operators';
import { AuthService } from './auth';
import { UserData } from '../interfaces/user.interface';

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

  createApplication(userData: UserData): Observable<string> {
    const headers = this.getAuthHeaders();
    const url = `${this.apiUrl}/job-application-request/`;
    // Adapter les champs pour l'API
    const payload = {
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName
    };
    return this.http.post<AppRequestResponse>(url, payload, { headers }).pipe(
      map(response => response.url),
      tap(url => console.log('Application request created:', url)),
    );
  }

  pollStatus(statusUrl: string): Observable<StatusResponse> {
    const headers = this.getAuthHeaders();
    // On va poller toutes les 2 secondes jusqu'à obtenir 'COMPLETED'
    return timer(0, 2000).pipe(
      switchMap(() => this.http.get<StatusResponse>(statusUrl, { headers })),
      tap(response => console.log('Polling status:', response.status, response)),
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