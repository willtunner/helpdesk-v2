import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-base',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './base.component.html',
  styleUrl: './base.component.scss'
})
export class BaseComponent {
  @Input() collapsed = false;
  @Input() screenWidth = 0;
  isLoginRoute = false;

  getBodyClass(): string  {
    let styleClass = '';

    if(this.collapsed && this.screenWidth > 768) {
      styleClass = 'body-trimmed';
    } else if(this.collapsed && this.screenWidth <= 768 && this.screenWidth > 0) {
      styleClass = 'body-md-screen'
    }
    return styleClass;
  }

  ngOnInit(){
    console.log('URL:', this.router.url);

    if(this.router.url === '/login' || this.router.url === '/') {
      console.log('Login route');
      this.isLoginRoute = true;
    }
      
  }

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.isLoginRoute = this.router.url === '/login';
    });

    
  }
}
