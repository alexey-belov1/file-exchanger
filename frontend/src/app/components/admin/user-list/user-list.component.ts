import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService, User } from '../../../services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Пользователи</h2>
      <button class="btn btn-primary" (click)="showCreateForm = !showCreateForm">
        {{ showCreateForm ? 'Отмена' : 'Добавить пользователя' }}
      </button>
    </div>

    <div class="card mb-4 shadow-sm" *ngIf="showCreateForm">
      <div class="card-body">
        <h5 class="card-title">Новый пользователь</h5>
        <form [formGroup]="createForm" (ngSubmit)="onCreate()">
          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">Имя пользователя</label>
              <input type="text" class="form-control" formControlName="username">
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Пароль</label>
              <input type="password" class="form-control" formControlName="password">
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Роль</label>
              <select class="form-select" formControlName="role">
                <option value="ROLE_USER">Пользователь</option>
                <option value="ROLE_ADMIN">Администратор</option>
              </select>
            </div>
          </div>
          <button type="submit" class="btn btn-success" [disabled]="createForm.invalid || loading">
            Сохранить
          </button>
        </form>
      </div>
    </div>

    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>Имя пользователя</th>
          <th>Роль</th>
          <th>Дата создания</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let user of users">
          <td>{{ user.username }}</td>
          <td>{{ user.role === 'ROLE_ADMIN' ? 'Администратор' : 'Пользователь' }}</td>
          <td>{{ user.createdAt | date:'short' }}</td>
          <td>
            <button class="btn btn-sm btn-danger" (click)="deleteUser(user.id)" [disabled]="user.username === 'admin'">Удалить</button>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  users: User[] = [];
  showCreateForm = false;
  loading = false;

  createForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    role: ['ROLE_USER', Validators.required]
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(users => this.users = users);
  }

  onCreate() {
    if (this.createForm.valid) {
      this.loading = true;
      this.userService.createUser(this.createForm.value).subscribe({
        next: () => {
          this.loadUsers();
          this.createForm.reset({ role: 'ROLE_USER' });
          this.showCreateForm = false;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          alert('Ошибка при создании пользователя');
        }
      });
    }
  }

  deleteUser(id: string) {
    if (confirm('Вы уверены, что хотите удалить пользователя?')) {
      this.userService.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }
}
