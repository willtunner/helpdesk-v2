import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import { SublevelMenuComponent } from './sublevel-menu/sublevel-menu.component';
import { NAVBAR_DATA } from './navbar-data';
import { FirstLetterPipe } from '../../../pipes/firstLetterUpperCase.pipe';
import { INavbarData } from '../../../interface/side-nav.interface';
import { SessionService } from '../../../services/session.service';
import { SidebarService } from '../../../services/sidebar.service';
import { TranslateModule } from '@ngx-translate/core';

interface SideNaveToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterModule, CommonModule, MatIconModule, 
    SublevelMenuComponent, FirstLetterPipe, TranslateModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({opacity: 0}),
        animate('350ms',
          style({opacity: 1})
        )
      ]),
      transition(':leave', [
        style({opacity: 1}),
        animate('350ms',
          style({opacity: 0})
        )
      ])
    ]),
    trigger('rotate', [
      transition(':enter', [
        animate('1000ms',
          keyframes([
            style({transform: 'rotate(0deg)', offset: '0'}),
            style({transform: 'rotate(2turn)', offset: '1'}),
          ])
        )
      ])
    ])
  ]
})

export class AppSidenavComponent implements OnInit {

  // Output para emitir eventos de colapso e tamanho da tela para outros componentes
  @Output() onToggleSideNav: EventEmitter<SideNaveToggle> = new EventEmitter();

  screenWidth = 0;  // Variável para armazenar a largura da tela
  collapsed = false;  // Controla se a barra lateral está colapsada ou não
  navData: INavbarData[] = [];  // Dados para os itens da barra de navegação
  multiple: boolean = false;  // Define se múltiplos menus podem ser expandidos ao mesmo tempo
  user: any | null = null;

  constructor(
    private sidebarService: SidebarService, 
    public router: Router, 
    private sessionService: SessionService) { }

  // HostListener para monitorar mudanças no tamanho da janela e ajustar o estado da barra lateral
  @HostListener('window:resize', ['$event'])


  // Se a tela ficar menor ou igual a 768px, força o fechamento da barra lateral
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 768) {
      this.collapsed = false;
      this.onToggleSideNav.emit({
        collapsed: this.collapsed,
        screenWidth: this.screenWidth,
      });
    }
  }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth; // Obtém a largura inicial da tela
    this.user = this.sessionService.getSession();
    // Faz uma requisição para obter os dados da barra de navegação através do serviço
    this.navData = NAVBAR_DATA;

    if (this.user) {
      this.navData = this.sidebarService.getMenuForUser(this.user);
    }
  }

   // Alterna o estado da barra lateral entre colapsado e expandido
  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.onToggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth
    });
  }


  // Fecha a barra lateral, emitindo o estado atualizado
  closeSidenav(): void {
    this.collapsed = false;
    this.onToggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth
    });
  }

  // Lida com o clique em um item de navegação, expandindo ou colapsando
  handleClick(item: INavbarData): void {
    this.shrinkItems(item);
    item.expanded = !item.expanded;
  }

  // Retorna a classe 'active' se o item atual corresponder à rota ativa
  getActiveClass(data: INavbarData): string {
    return this.router.url.includes(data.routeLink) ? 'active' : '';
  }

   // Colapsa todos os itens da navegação, exceto o que foi clicado, se 'multiple' for falso
  shrinkItems(item: INavbarData): void {
    if (!this.multiple) {
      for (let modelItem of this.navData) {
        if (item !== modelItem && modelItem.expanded) {
          modelItem.expanded = false;
        }
      }
    }
  }

}
