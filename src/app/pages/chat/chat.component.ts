import { CommonModule } from '@angular/common';
import { Component, computed, effect, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { ChatRoom, User } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { UserOnlineComponent } from './user-online/user-online.component';
import { ChatService } from '../../services/chat-service.service';
import { WaitingListComponent } from './waiting-list/waiting-list.component';
import { OperatorsOnlineComponent } from './operators-online/operators-online.component';
import { UserType } from '../../enums/user-types.enum';
import { UserService } from '../../services/user.service';
import { ActiveChatsComponent } from './active-chats/active-chats.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MatCardModule, MatTableModule, CommonModule, 
    UserOnlineComponent, WaitingListComponent, 
    OperatorsOnlineComponent, ActiveChatsComponent, ChatWindowComponent  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
  currentUser!: User;
  userRole!: UserType;
  isLoggedIn: boolean = false;
  UserType = UserType;
  activeChats = computed<ChatRoom[]>(() => {
    const allSupport = this.customerSupport();
    if (this.currentUser && this.userRole === UserType.OPERATOR) {
      return allSupport.filter(chat => chat.operator?.id === this.currentUser.id);
    }
    return [];
  });
  isOnline = false;

  // 👇 computed para sempre refletir os signals do serviço
  operators = computed(() => this.chatService.operators());
  waitingList = computed(() => this.chatService.clientWaitingList());
  customerSupport = computed(() => this.chatService.customerSupport());

  constructor(private auth: AuthService, private chatService: ChatService, 
    private userService: UserService) { 
    const session = this.auth.currentUser();
    if (session) {
      this.currentUser = session;
      console.log('Sessão carregada:', this.currentUser);
    }

    effect(() => {
      console.log('Operators operators:', this.operators());
      console.log('Clientes waitingList:', this.waitingList());
      console.log('customerSupport', this.customerSupport());

      const allSupport = this.customerSupport();
  
    });

    try {
      this.userRole = this.userService.getEffectiveUserRole(this.currentUser);
      console.log('Role detectada:', this.userRole);
    } catch (err) {
      console.error('Erro ao detectar role:', err);
    }
  }

  async ngOnInit() {
    this.chatService.initializeOperators();
    
    if (this.currentUser) {
      this.isLoggedIn = await this.chatService.isUserOnline(this.currentUser.id);
    }

    // 👇 sempre que carregar, busca os chats do operador logado
    if (this.userRole === UserType.OPERATOR) {
      await this.chatService.loadCustomerSupport(this.currentUser.id);
    }

    
  }

  

  onLogin() { 
    this.logInChat();
  }

  async toggleLoginStatus() {
    console.warn('Toggle Login Status', this.isLoggedIn);
    
    try {
      if (this.isLoggedIn) {
        await this.logOutChat();
      } else {
        await this.logInChat();
      }
    } catch (error) {
      console.error('Erro ao alternar status de login:', error);
    }
  }

  async logOutChat() {
    if (this.currentUser) {
      try {
        await this.chatService.logUserOutChat(this.currentUser);
        this.isLoggedIn = false;
        
        // Atualiza também o usuário local
        this.currentUser.isLoggedIn = false;
        this.currentUser.connection = null;
        
        console.log('Logout realizado com sucesso');
      } catch (error) {
        console.error('Erro no logout:', error);
        throw error;
      }
    }
  }

  async logInChat() {
    if (this.currentUser) {
      try {
        const updatedUser = await this.chatService.logUserInChat(this.currentUser);
        this.isLoggedIn = updatedUser.user.isLoggedIn;
        this.currentUser = { ...this.currentUser, ...updatedUser };
        console.log('Usuário logado no chat:', updatedUser);
      } catch (error) {
        console.error('Erro no login:', error);
        throw error;
      }
    }
  }
}
