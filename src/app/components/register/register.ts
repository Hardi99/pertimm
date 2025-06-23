// Fichier : src/app/components/register/register.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

// Validateur custom pour vérifier que les mots de passe correspondent
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  // Si les mots de passe ne sont pas encore saisis, on ne valide pas
  if (password && confirmPassword && password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
      <h2>Créer un compte</h2>
      <div>
        <label for="email">Email</label>
        <input id="email" type="email" formControlName="email">
      </div>
      <div>
        <label for="password">Mot de passe</label>
        <input id="password" type="password" formControlName="password">
      </div>
      <div>
        <label for="confirmPassword">Confirmer le mot de passe</label>
        <input id="confirmPassword" type="password" formControlName="confirmPassword">
        
        @if (registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched) {
          <p class="error">Les mots de passe ne correspondent pas.</p>
        }
      </div>

      <button type="submit" [disabled]="registerForm.invalid">S'inscrire</button>

      @if (successMessage) { <p>{{ successMessage }}</p> }
      @if (errorMessage) { <p class="error">{{ errorMessage }}</p> }
      <a style="text-align: center;" routerLink="/login">Déjà un compte ? Se connecter</a>
    </form>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  successMessage = '';
  errorMessage = '';

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]], // On ajoute une contrainte de longueur
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordMatchValidator }); // On ajoute le validateur au groupe

  onSubmit() {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire.';
      return;
    }
    
    this.errorMessage = '';
    const formValue = this.registerForm.getRawValue();

    const registrationData = {
      email: formValue.email!,
      password1: formValue.password!,
      password2: formValue.confirmPassword!
    };

    this.authService.register(registrationData).subscribe({
      next: () => {
        this.successMessage = 'Compte créé avec succès ! Redirection vers le dashboard...';
        // Puisque le service a déjà géré le token, on peut naviguer directement.
        setTimeout(() => this.router.navigate(['/dashboard']), 1000);
      },
      error: (err) => {
        // On gère les erreurs renvoyées par l'API
        if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Une erreur inconnue est survenue.';
        }
        console.error(err);
      }
    });
  }
}