import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../../../models/models';
import { UserService } from '../../../services/user.service';
import { DynamicButtonComponent } from '../../../shared/components/action-button/action-button.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-user-online',
  standalone: true,
  imports: [DynamicButtonComponent, MatCardModule],
  templateUrl: './user-online.component.html',
  styleUrl: './user-online.component.scss'
})
export class UserOnlineComponent {
  @Input() currentUser!: User;
  @Input() isOnline = false;
  @Input() isLoggedIn = false; // ← Adicione esta linha
  @Output() login = new EventEmitter<void>();
  role: string = '';

  constructor(private userService: UserService) {}

  ngOnInit() {
    if (this.currentUser) {
      this.role = this.userService.getEffectiveUserRole(this.currentUser);
      console.log('Role detectada:', this.role);
    }
  }

  onLogin() {
    if(this.currentUser.roles?.includes('CLIENT')) {
      console.log('Cliente entrando na fila de espera...');

    }

    this.login.emit();
  }
}