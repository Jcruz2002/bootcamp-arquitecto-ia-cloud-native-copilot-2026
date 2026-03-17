import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { HomeRedirectComponent } from './pages/home-redirect.component';
import { LoginComponent } from './pages/login/login.component';
import { UsersComponent } from './pages/users/users.component';

export const routes: Routes = [
	{ path: '', component: HomeRedirectComponent },
	{ path: 'login', component: LoginComponent },
	{ path: 'users', component: UsersComponent, canActivate: [authGuard] },
	{ path: '**', redirectTo: '' },
];
