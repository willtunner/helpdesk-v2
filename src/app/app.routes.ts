import { Routes } from '@angular/router';
import { LoginComponent } from './public/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './guards/auth.guard';
import { NewAccountComponent } from './public/new-account/new-account.component';
import { RecoverPasswordComponent } from './public/recover-password/recover-password.component';
import { ExemplesComponent } from './pages/exemples/exemples.component';
import { ClientHomeComponent } from './pages/home/client-home/client-home.component';
import { CompaniesComponent } from './pages/companies/companies.component';
import { CallsComponent } from './pages/calls/calls.component';
import { ChatComponent } from './pages/chat/chat.component';
import { SystemVersionComponent } from './pages/system-version/system-version.component';
import { DeveloperAreaComponent } from './pages/developer-area/developer-area.component';
import { RestrictedAreaComponent } from './pages/restricted-area/restricted-area.component';
import { ProfileSettingsComponent } from './pages/profile-settings/profile-settings.component';
import { TutorialsComponent } from './pages/tutorials/tutorials.component';
import { TiltCardsComponent } from './shared/components/tilt-cards/tilt-cards.component';
import { HolidayCalendarComponent } from './shared/components/holiday-calendar/holiday-calendar.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'criar-conta', component: NewAccountComponent },
  { path: 'recuperar-senha', component: RecoverPasswordComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'companies', component: CompaniesComponent, canActivate: [authGuard] },
  { path: 'clients', component: ClientHomeComponent, canActivate: [authGuard] },
  { path: 'calls', component: CallsComponent, canActivate: [authGuard] },
  { path: 'calls/:id', component: CallsComponent, canActivate: [authGuard]  },
  { path: 'chat', component: ChatComponent, canActivate: [authGuard] },
  { path: 'system-version', component: SystemVersionComponent, canActivate: [authGuard] },
  { path: 'developer-area', component: DeveloperAreaComponent, canActivate: [authGuard] },
  { path: 'tutorials', component: TutorialsComponent, canActivate: [authGuard] },
  { path: 'restricted-area', component: RestrictedAreaComponent, canActivate: [authGuard] },
  { path: 'profile-settings', component: ProfileSettingsComponent, canActivate: [authGuard] },
  { path: 'exemples', component: ExemplesComponent, canActivate: [authGuard] },
  { path: 'cards', component: TiltCardsComponent, canActivate: [authGuard] },
  { path: 'calendar', component: HolidayCalendarComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
