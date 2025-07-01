import { Component, Input } from '@angular/core';
import { state, trigger, style, transition, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { fadeInOut, INavbarData } from '../../../../interface/side-nav.interface';

@Component({
  selector: 'app-sublevel-menu',
  standalone: true,
  imports: [],
  templateUrl: './sublevel-menu.component.html',
  styleUrl: './sublevel-menu.component.scss',
  animations: [
    fadeInOut,
    trigger('submenu', [
      state('hidden', style({
        height: '0',
        overflow: 'hidden'
      })),
      state('visible', style({
        height: '*'
      })),
      transition('visible <=> hidden', [style({overflow: 'hidden'}),
        animate('{{transitionParams}}')]),
      transition('void => *', animate(0))
    ])
  ]
})
export class SublevelMenuComponent {
  @Input() data: INavbarData = {
    routeLink: '',
    icon: '',
    label: '',
    items: []
  }

  @Input() collapsed = false;
  @Input() animating: boolean | undefined;
  @Input() expanded: boolean | undefined;
  @Input() multiple: boolean = false;
  
  constructor(public router: Router) { }

  ngOnInit(): void {
  }

  handleClick(item: any): void {
    if (!this.multiple) {
      if (this.data.items && this.data.items.length > 0) {
        for(let modelItem of this.data.items) {
          if (item !== modelItem && modelItem.expanded) {
            modelItem.expanded = false;
          }
        }
      }
    }
    item.expanded = !item.expanded;
  }

  getActiveClass(item: INavbarData): string {
    return item.expanded && this.router.url.includes(item.routeLink) ? 'active-sublevel' : '';
  }
}
