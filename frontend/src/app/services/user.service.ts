import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface User {
  id: string;
  username: string;
  role: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/admin/users';

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get<User[]>(this.apiUrl);
  }

  createUser(user: any) {
    return this.http.post<User>(this.apiUrl, user);
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
