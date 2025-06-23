import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <h2>Connexion</h2>
      <div>
        <label for="email">Email</label>
        <input id="email" type="email" formControlName="email">
      </div>
      <div>
        <label for="password">Mot de passe</label>
        <input id="password" type="password" formControlName="password">
      </div>
      <button type="submit" [disabled]="loginForm.invalid">Se connecter</button>

      @if (errorMessage) {
        <p class="error">{{ errorMessage }}</p>
      }
      <a style="text-align: center;" routerLink="/register">Pas de compte ? S'inscrire</a>
    </form>
  `
})
export class LoginComponent {
  // Injection correcte et concise
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  successMessage = '';
  errorMessage = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire.';
      return;
    }

    this.authService.login(this.loginForm.value as any).subscribe({
      next: () => {
        this.successMessage = 'User connecté avec succès ! Redirection vers le dashboard...';
        // Puisque le service a déjà géré le token, on peut naviguer directement.
        setTimeout(() => this.router.navigate(['/dashboard']), 1000);
      },
      error: (err) => {
        this.errorMessage = 'Email ou mot de passe incorrect.';
        console.error(err);
      }
    });
  }
}