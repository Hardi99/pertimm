import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container">
      <h1>404</h1>
      <p>Oups ! La page que vous cherchez n'existe pas.</p>
      <a routerLink="/dashboard">Retourner à l'accueil</a>
    </div>
  `,
  styles: [`
    .container {
      text-align: center;
      padding-top: 80px;
    }
    h1 {
      font-size: 6rem;
      font-weight: bold;
      margin: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent {}