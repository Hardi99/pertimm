import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, UserLogin, UserRegister } from '../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authUrl = 'https://hire-game.pertimm.dev/api/v1.1/auth';

  // Le signal est la source de vérité. C'est un conteneur de valeur.
  currentUser = signal<User | null>(this.getUserFromStorage());
  
  // Signal dérivé (computed). Retourne un booléen explicite.
  isAuthenticated = computed(() => {
    const user = this.currentUser();
    return !!(user && typeof user.token === 'string' && user.token.length > 0);
  });

  login(credentials: UserLogin): Observable<User> {
    return this.http.post<User>(`${this.authUrl}/login/`, credentials).pipe(
      tap(user => {
        this.currentUser.set(user); // On met à jour le signal
        console.log('User connecté:', user);
        this.router.navigate(['/dashboard']);
      })
    );
  }

  register(data: UserRegister): Observable<User> {
    return this.http.post<User>(`${this.authUrl}/register/`, data).pipe(
      tap(user => {
        this.currentUser.set(user); // On met à jour le signal
        this.router.navigate(['/dashboard']);
      })
    );
  }

  logout(): void {
    this.currentUser.set(null); // On met à jour le signal
    localStorage.removeItem('currentUser'); // On efface le stockage local
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    // On lit la valeur du signal. Si l'utilisateur existe, on retourne son token.
    // L'opérateur '?.' (optional chaining) gère le cas où currentUser() est null.
    return this.currentUser()?.token ?? null;
  }
  
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }
}