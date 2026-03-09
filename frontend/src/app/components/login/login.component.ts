import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mt-5">
      <div class="auth-card-wrapper">
        <div class="card shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-center mb-4">Авторизация</h3>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label for="username" class="form-label">Имя пользователя</label>
                <input type="text" id="username" class="form-control" formControlName="username">
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Пароль</label>
                <input type="password" id="password" class="form-control" formControlName="password">
              </div>
              <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
              <button type="submit" class="btn btn-primary w-100" [disabled]="loginForm.invalid || loading">
                Войти
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  error = '';
  loading = false;

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/files']);
        },
        error: (err) => {
          this.error = 'Неверные учетные данные';
          this.loading = false;
        }
      });
    }
  }
}
