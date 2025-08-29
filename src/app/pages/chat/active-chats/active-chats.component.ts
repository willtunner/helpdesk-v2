import { Component, Input } from '@angular/core';
import { ChatRoom, Message } from '../../../models/models';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../services/chat-service.service';
import { ChatVisibilityService } from '../../../services/chat-visibility.service';

@Component({
  selector: 'app-active-chats',
  standalone: true,
  imports: [MatCardModule, CommonModule],
  templateUrl: './active-chats.component.html',
  styleUrl: './active-chats.component.scss'
})
export class ActiveChatsComponent {
  @Input() activeChats: ChatRoom[] = [];
  chatActived!: ChatRoom;
  selectedAttendeeId: string | null = null;
  operators: any = [];
  mensagemAtual: Message | Message[] = [];


  constructor(private chatService: ChatService, private chatVisibilityService: ChatVisibilityService) {
    
  }

  viewChat(chat: ChatRoom): void {
    console.log('Chat:', chat);
    this.chatActived = chat;
    this.selectedAttendeeId = chat.id;
  
    // Atualiza o operador correspondente com o campo "occurrency"
    this.operators = this.operators.map((op: any) => {
      if (op.id === chat.operator?.id) {
        return { ...op, occurrency: chat.occurrence || 'Indefinido' };
      }
      return op;
    });
  
    this.chatService.listenToMessages(chat.id); 
    this.chatService.saveRoomActive(chat);
  
    this.chatService.activeMessages$.subscribe((messages) => {
      this.mensagemAtual = messages;
    });
  
    this.chatVisibilityService.showChat();
  }
}
