import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PertimmApiService } from '../../core/services/pertimm-api';
import { AuthService } from '../../core/services/auth';

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
    if (!user) return;

    // Le composant délègue tout au service.
    this.apiService.createApplication({ email: user.email, firstName: user.first_name, lastName: user.last_name })
      .pipe(/* ... le reste du pipe RxJS ... */)
      .subscribe({
        next: () => { addLog('✅ TEST RÉUSSI !'); this.isLoading.set(false); },
        error: (err) => { addLog(`❌ ERREUR : ${err.message}`); this.isLoading.set(false); }
      });
  }
}