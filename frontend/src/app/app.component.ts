import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar mb-4" *ngIf="authService.isAuthenticated()">
      <div class="container d-flex align-items-center">
        <div *ngIf="authService.isAdmin()" class="d-flex align-items-center">
          <a class="navbar-brand" routerLink="/files">File Exchanger</a>
          <ul class="navbar-nav mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" routerLink="/files" routerLinkActive="active">Мои файлы</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/admin/users" routerLinkActive="active">Пользователи</a>
            </li>
          </ul>
        </div>
        <div class="d-flex align-items-center text-white ms-auto">
          <span class="me-2">{{ authService.currentUser()?.username }}</span>
          <button class="btn btn-outline-light btn-sm" (click)="authService.logout()">Выйти</button>
        </div>
      </div>
    </nav>

    <div class="container">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  authService = inject(AuthService);
}
