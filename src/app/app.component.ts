import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppSidenavComponent } from './shared/components/sidenav/sidenav.component';
import { BaseComponent } from './shared/components/base/base.component';
import { AuthService } from './services/auth.service';
import { SideNaveToggle } from './interface/side-nav.interface';
import { FloatingLanguageSelectorComponent } from './shared/components/floating-language-selector/floating-language-selector.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BaseComponent, AppSidenavComponent, FloatingLanguageSelectorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'helpdesk-v2';

  showSideNav = false;
  isSideNavCollapsed = false;
  screenWidth = 0;

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  onToggleSideNav(data: SideNaveToggle): void {
    this.screenWidth = data.screenWidth;
    this.isSideNavCollapsed = data.collapsed;
  }

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      const publicRoutes = ['/login', '/criar-conta', '/recuperar-senha'];
      this.showSideNav = !publicRoutes.includes(this.router.url);
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
