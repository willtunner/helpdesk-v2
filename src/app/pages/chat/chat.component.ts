import { CommonModule } from '@angular/common';
import { Component, computed, effect, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { DynamicButtonComponent } from '../../shared/components/action-button/action-button.component';
import { User } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { UserOnlineComponent } from './user-online/user-online.component';
import { ChatService } from '../../services/chat-service.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MatCardModule, MatTableModule, CommonModule, UserOnlineComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
  currentUser!: User;
  // waitingList: any = [];
  isLoggedIn: boolean = false;
  // operators: User[] = [];

  // 👇 computed para sempre refletir os signals do serviço
  operators = computed(() => this.chatService.operators());
  waitingList = computed(() => this.chatService.clientWaitingList());

  constructor(private auth: AuthService, private chatService: ChatService) { 
    const session = this.auth.currentUser();
    if (session) {
      this.currentUser = session;
      console.log('Sessão carregada:', this.currentUser);
    }

    effect(() => {
      console.log('Operators atualizados:', this.operators());
      console.log('Clientes atualizados:', this.waitingList());
    });
  }

  async ngOnInit() {
    await this.chatService.initializeOperators();
    console.log('waitingList', this.waitingList);
  
    if (this.currentUser) {
      this.isLoggedIn = await this.chatService.isUserOnline(this.currentUser.id);
      console.log(`Usuário ${this.currentUser.name} está online?`, this.isLoggedIn);
    }
  }
  

  isOnline = false;

  activeChats = ['Teste', 'Alfredo'];

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
        this.isLoggedIn = updatedUser.isLoggedIn;
        this.currentUser = { ...this.currentUser, ...updatedUser };
        console.log('Usuário logado no chat:', updatedUser);
      } catch (error) {
        console.error('Erro no login:', error);
        throw error;
      }
    }
  }
}
