import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { FileListComponent } from './components/files/file-list/file-list.component';
import { UserListComponent } from './components/admin/user-list/user-list.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'files', component: FileListComponent, canActivate: [authGuard] },
  { path: 'admin/users', component: UserListComponent, canActivate: [authGuard, adminGuard] },
  { path: '', redirectTo: '/files', pathMatch: 'full' }
];
