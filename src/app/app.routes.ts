import { Routes } from '@angular/router';
import { LoginComponent } from './public/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './guards/auth.guard';
import { NewAccountComponent } from './public/new-account/new-account.component';
import { RecoverPasswordComponent } from './public/recover-password/recover-password.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'criar-conta', component: NewAccountComponent },
  { path: 'recuperar-senha', component: RecoverPasswordComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
