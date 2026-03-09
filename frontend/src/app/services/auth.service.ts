import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

export interface AuthResponse {
  token: string;
  type: string;
  id: string;
  username: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  
  currentUser = signal<{username: string, roles: string[]} | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const roles = localStorage.getItem('roles');
    if (token && username && roles) {
      this.currentUser.set({ username, roles: JSON.parse(roles) });
    }
  }

  login(credentials: any) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username);
        localStorage.setItem('roles', JSON.stringify(response.roles));
        this.currentUser.set({ username: response.username, roles: response.roles });
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.roles.includes('ROLE_ADMIN') ?? false;
  }
  
  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}
