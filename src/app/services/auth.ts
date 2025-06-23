// Fichier : src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Router } from '@angular/router';

// On crée une interface pour notre objet utilisateur
export interface User {
  uid: string;
  email: string;
  url: string;
  token: string;
  first_name: string;
  last_name: string;
  level: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authUrl = 'https://hire-game.pertimm.dev/api/v1.1/auth';
  // On remplace le tokenSubject par un currentUserSubject
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  
  // On expose l'utilisateur actuel via un observable public
  public currentUser$ = this.currentUserSubject.asObservable();
  // L'état d'authentification est maintenant dérivé de la présence d'un utilisateur
  public isAuthenticated$: Observable<boolean> = this.currentUser$.pipe(map(user => !!user));
  
  private http = inject(HttpClient);
  private router = inject(Router);
  
  login(credentials: { email: string, password: string }): Observable<User> {
    return this.http.post<User>(`${this.authUrl}/login/`, credentials).pipe(
      tap(user => this.authenticateUser(user))
    );
  }

  register(userData: { email: string, password1: string, password2: string }): Observable<User> {
    return this.http.post<User>(`${this.authUrl}/register/`, userData).pipe(
      tap(user => this.authenticateUser(user))
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
  
  // Fonctions utilitaires
  getToken(): string | null {
    return this.currentUserSubject.getValue()?.token ?? null;
  }

  private authenticateUser(user: User) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
  
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }
}