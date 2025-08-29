import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SessionService } from '../../../services/session.service';
import { Message } from '../../../models/models';
import { Subscription } from 'rxjs';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ChatImageModalComponent } from '../chat-image-modal/chat-image-modal.component';
import { ChatService } from '../../../services/chat-service.service';
import { ChatVisibilityService } from '../../../services/chat-visibility.service';
import { UploadService } from '../../../services/upload.service';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatIconModule, 
    MatButtonModule, 
    DateFormatPipe, 
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  providers: [DatePipe],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss'],
})
export class ChatWindowComponent implements OnInit, OnDestroy {
  @ViewChild('chatWindow') chatWindow!: ElementRef<HTMLDivElement>;

  messages: Message[] = [];
  currentUser: any;
  newMessage = '';
  messageContent: string = '';
  chatRoomId: string = '';
  private subscription: Subscription = new Subscription();
  isUploading = false; 
  file!: File;
  isChatVisible: boolean = false;


  constructor(
    private sessionService: SessionService,
    private chatService: ChatService,
    private chatVisibilityService: ChatVisibilityService,
    private dialog: MatDialog,
    private uploadService: UploadService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.sessionService.getSession();
    this.loadMessages();
    this.subscription.add(
      this.chatVisibilityService.isChatVisible$.subscribe((isVisible: boolean) => {
        this.isChatVisible = isVisible;
      })
    );

  }


  async loadMessages() {
    this.subscription.add(
      this.chatService.activeMessages$.subscribe((messages) => {
        this.messages = messages;
        console.log('Mensagens:', this.messages); // Exibe no console (ou em algum lugar no front)
        

        this.scrollToBottom(); // Rola para a última mensagem após carregar
      })
    );
  }

  loadUnReadMessages() {
    const unreadCount = this.chatService.getUnreadMessagesCount(this.messages, this.currentUser.id);
    console.log(`Mensagens não lidas: ${unreadCount}`); // Exibe no console (ou em algum lugar no front)
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Enviar mensagem
  async sendMessage() {
    if (!this.messageContent.trim()) return;
  
    const newMessage: Message = {
      sender: this.currentUser.id,
      content: this.messageContent,
      timestamp: new Date(),
      imageUrl: this.currentUser.imageUrl,
      isRead: false,
    };
    const chatRoomId = this.chatService.getRoomActive()?.id;
  
    try {
      if (chatRoomId) {
        await this.chatService.updateMessages(chatRoomId, newMessage);
        
        this.messageContent = ''; // Limpa o campo de texto após envio
        await this.updateActiveMessages(chatRoomId); // Atualiza mensagens sem duplicar
        this.scrollToBottom(); // Rola para a última mensagem
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  }

  private async updateActiveMessages(chatRoomId: string): Promise<void> {
    try {
      const messages = await this.chatService.fetchMessages(chatRoomId); // Obtém mensagens do banco
      this.chatService.saveActiveMessage(messages); // Atualiza mensagens sem duplicação
      this.messages = this.chatService.getActiveMessage(); // Carrega mensagens para exibição
    } catch (error) {
      console.error('Erro ao atualizar mensagens ativas:', error);
    }
  }



  attachFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();
  
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0];
        this.isUploading = true;
  
        try {
          const uploadUrl = await this.uploadService.uploadImageToFirebaseChat(file, 'img-chat');
          // Enviar a mensagem com a URL da imagem salva em `uploadImg`
          const newMessage: Message = {
            sender: this.currentUser.id,
            content: '', // Mensagem vazia para imagens
            timestamp: new Date(),
            imageUrl: this.currentUser.imageUrl, // Foto do remetente
            uploadImg: uploadUrl, // URL da imagem enviada
          };
  
          const chatRoomId = this.chatService.getRoomActive()?.id;
          if (chatRoomId) {
            await this.chatService.updateMessages(chatRoomId, newMessage);
            await this.updateActiveMessages(chatRoomId);
            this.scrollToBottom();
          }
        } catch (error) {
          console.error('Erro ao enviar a imagem:', error);
        } finally {
          this.isUploading = false;
        }
      }
    };
  }
  
  

  private scrollToBottom(): void {
    if (this.chatWindow) {
      setTimeout(() => {
        this.chatWindow.nativeElement.scrollTop = this.chatWindow.nativeElement.scrollHeight;
      }, 0); // Timeout para garantir que o DOM já foi atualizado
    }
  }

  openImageModal(imageUrl: string): void {
    this.dialog.open(ChatImageModalComponent, {
      data: { imageUrl },
      panelClass: 'custom-dialog-container'
    });
  }

  async markMessage() {
    const chatRoomId = this.chatService.getRoomActive()?.id;
    console.log('ChatRoomId:', chatRoomId);
    if (!chatRoomId) return;
    await this.chatService.markMessagesAsRead(chatRoomId, this.currentUser.id);
  }

  

}
