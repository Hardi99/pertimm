import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RegisterForm } from '@core/interfaces/auth-form.interface' // Notre type de formulaire
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth';
import { Router, RouterLink } from '@angular/router';
import { UserRegister } from '@core/interfaces/user.interface';

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
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush, // On applique OnPush
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

      @if (successMessage()) { <p>{{ successMessage() }}</p> }
      @if (errorMessage()) { <p class="error">{{ errorMessage() }}</p> }
      <a style="text-align: center;" routerLink="/login">Déjà un compte ? Se connecter</a>
    </form>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  // Un signal local pour les messages d'erreur.
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  // Le formulaire est typé avec notre interface.
  registerForm = this.fb.group<RegisterForm>({
    email: this.fb.control('', [Validators.required, Validators.email]),
    password: this.fb.control('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: this.fb.control('', [Validators.required])
  }, { validators: passwordMatchValidator });

  onSubmit() {
    if (this.registerForm.invalid) {
      this.errorMessage.set('Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    // Le composant envoie juste les données. Le service s'occupe de la redirection et de l'état.
    this.authService.register(this.registerForm.value as UserRegister).subscribe({
      next: () => {
        this.successMessage.set('User enregistré avec succès ! Connexion et redirection vers le dashboard...');
      },
      error: (err) => this.errorMessage.set(err.error?.message || 'Erreur inconnue.')
    });
  }
}