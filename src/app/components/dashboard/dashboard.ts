// Fichier : src/app/components/dashboard/dashboard.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PertimmApiService } from '../../services/pertimm-api';
import { AuthService, User } from '../../services/auth';
import { switchMap, tap, filter, take } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Dashboard</h2>
    <p>Bienvenue, {{ (authService.currentUser$ | async)?.email }} !</p>
    <p>Cliquez ci-dessous pour lancer le test de candidature.</p>
    
    <button (click)="runTest()" [disabled]="isLoading">
      {{ isLoading ? 'Test en cours...' : 'Lancer le test' }}
    </button>
    
    <ul>
      @for (log of logs; track $index) {
        <li>{{ log }}</li>
      } @empty {
        <li>Le journal des opérations apparaîtra ici.</li>
      }
    </ul>
  `
})
export class DashboardComponent {
  // On injecte les deux services
  private apiService = inject(PertimmApiService);
  public authService = inject(AuthService); // public pour l'utiliser dans le template

  isLoading = false;
  logs: string[] = [];

  runTest() {
    this.isLoading = true;
    this.logs = [];
    const addLog = (msg: string) => this.logs.push(msg);

    // On récupère l'utilisateur actuel UNE SEULE FOIS pour lancer le test
    this.authService.currentUser$.pipe(take(1)).subscribe(currentUser => {
      if (!currentUser) {
        addLog('❌ ERREUR : Utilisateur non connecté.');
        this.isLoading = false;
        return;
      }

      // On construit le payload avec les VRAIES données utilisateur
      const applicationData = {
        email: currentUser.email,
        first_name: currentUser.first_name, // Sera une string vide si non défini, ce qui est parfait
        last_name: currentUser.last_name   // Idem
      };

      addLog('1. Création de la candidature...');
      this.apiService.createApplication(applicationData).pipe(
        tap(() => addLog('2. Polling du statut...')),
        switchMap(statusUrl => this.apiService.pollStatus(statusUrl)),
        filter(response => response.status === 'COMPLETED'),
        tap(() => addLog('3. Statut COMPLETED. Confirmation...')),
        switchMap(response => this.apiService.confirmApplication(response.confirmation_url!))
      ).subscribe({
        next: () => {
          addLog('4. ✅ TEST RÉUSSI !');
          this.isLoading = false;
        },
        error: err => {
          addLog(`❌ ERREUR : ${err.message || 'Erreur lors de la création de la candidature.'}`);
          this.isLoading = false;
        }
      });
    });
  }
}