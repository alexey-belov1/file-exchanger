import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4" *ngIf="authService.isAuthenticated()">
      <div class="container">
        <a class="navbar-brand" routerLink="/files">File Exchanger</a>
        <div class="collapse navbar-collapse d-flex justify-content-between">
          <ul class="navbar-nav mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" routerLink="/files" routerLinkActive="active">Мои файлы</a>
            </li>
            <li class="nav-item" *ngIf="authService.isAdmin()">
              <a class="nav-link" routerLink="/admin/users" routerLinkActive="active">Пользователи</a>
            </li>
          </ul>
          <div class="d-flex align-items-center text-white">
            <span class="me-3">{{ authService.currentUser()?.username }}</span>
            <button class="btn btn-outline-light btn-sm" (click)="authService.logout()">Выйти</button>
          </div>
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
