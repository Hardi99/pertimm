import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PertimmApiService } from '../../core/services/pertimm-api';
import { AuthService } from '../../core/services/auth';
import { first, switchMap } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush, // On applique OnPush
  template: `
    <h2>Dashboard</h2>
    @if (currentUser()) {
      <p>Bienvenue, {{ currentUser()!.email }} !</p>
    }
    <p>Cliquez ci-dessous pour lancer le test de candidature.</p>
    
    <button (click)="runTest()" [disabled]="isLoading()">
      {{ isLoading() ? 'Test en cours...' : 'Lancer le test' }}
    </button>
    
    <ul>
      @for (log of logs(); track $index) { <li>{{ log }}</li> }
      @empty { <li>Le journal des opérations apparaîtra ici.</li> }
    </ul>
  `
})
export class DashboardComponent {
  private apiService = inject(PertimmApiService);
  private authService = inject(AuthService);

  // On récupère les signals du service.
  currentUser = this.authService.currentUser;

  // Signals locaux pour l'état de la vue.
  isLoading = signal(false);
  logs = signal<string[]>([]);
  
  runTest() {
    this.isLoading.set(true);
    this.logs.set([]);
    const startTime = Date.now();
    const addLog = (msg: string) => {
      const time = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logs.update(currentLogs => [...currentLogs, `[${time}s] ${msg}`]);
    };

    const user = this.currentUser();
    if (!user) {
      addLog('Utilisateur non connecté.');
      this.isLoading.set(false);
      return;
    }

    // 1. Création de la demande
    this.apiService.createApplication({
      email: user.email,
      firstName: user.first_name, // Pour respecter UserData
      lastName: user.last_name
    })
    .pipe(
      // 2. Polling du statut jusqu'à COMPLETED
      switchMap((statusUrl: string) => {
        addLog('Demande créée, polling du statut...');
        return this.apiService.pollStatus(statusUrl).pipe(
          first((resp) => resp.status === 'COMPLETED')
        );
      }),
      // 3. Confirmation PATCH
      switchMap((statusResp) => {
        if (!statusResp.confirmation_url) throw new Error('Pas de confirmation_url dans la réponse');
        addLog('Statut COMPLETED, confirmation en cours...');
        return this.apiService.confirmApplication(statusResp.confirmation_url);
      })
    )
    .subscribe({
      next: () => { addLog('✅ TEST RÉUSSI !'); this.isLoading.set(false); },
      error: (err) => { addLog(`❌ ERREUR : ${err.message}`); this.isLoading.set(false); }
    });
  }
}