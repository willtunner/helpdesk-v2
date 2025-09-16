import { CommonModule } from '@angular/common';
import { Component, Input, computed, effect, OnDestroy, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { ChatService } from '../../../services/chat-service.service';
import { ChatRoom, User, userChatLogged } from '../../../models/models';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog copy/confirmation-dialog.component';
import { AuthService } from '../../../services/auth.service';
import { SendNotificationService } from '../../../services/send-notification.service';
import { NotificationType } from '../../../enums/notificationType.enum';

@Component({
    selector: 'app-waiting-list',
    imports: [CommonModule, MatCardModule, MatTableModule],
    templateUrl: './waiting-list.component.html',
    styleUrl: './waiting-list.component.scss'
})
export class WaitingListComponent implements OnInit, OnDestroy {

  @Input() data: userChatLogged[] | null = null;
  @Input() customerSupport: ChatRoom[] = [];
  @Input() currentUser!: User;

  // 🔹 transformei em signal mutável
  private tick = signal<number>(0);

  // 🔹 sempre recalcula quando o tick muda
  waitingList = computed(() => {
    this.tick(); // dependência reativa
    return this.chatService.clientWaitingList();
  });

  displayedColumns: string[] = ['name', 'sector', 'time'];

  private intervalId: any;

  constructor(private chatService: ChatService, private dialog: MatDialog, 
    private auth: AuthService, private messageService: SendNotificationService) {
    const session = this.auth.currentUser();
    if (session) {
      this.currentUser = session;
      console.log('Sessão carregada:', this.currentUser);
    }
  }

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.tick.update(v => v + 1); // 👉 força o recompute
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  getElapsedTime(entry: userChatLogged): string {
    const now = Date.now();

    let start: number;

    if (entry.date instanceof Date) {
      // caso já seja Date
      start = entry.date.getTime();
    } else if (entry.date?.seconds) {
      // caso seja Timestamp do Firestore
      start = entry.date.seconds * 1000 + Math.floor(entry.date.nanoseconds / 1_000_000);
    } else {
      // fallback (caso seja number)
      start = new Date(entry.date).getTime();
    }

    const diff = Math.floor((now - start) / 1000);

    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;

    return `${minutes}m ${seconds}s`;
  }

  async openDialog(client: userChatLogged): Promise<void> {
    try {

  
      // 👉 Verifica se já existe chat com este cliente
      const existingChat = await this.chatService.checkExistingChatRoom(
        client.user.id,
        this.currentUser.id
      );
  
      if (existingChat) {
        if (existingChat.operator.id === this.currentUser.id) {
          this.messageService.customNotification(
            NotificationType.ERROR,
            `⚠️ Você já está atendendo o cliente ${client.user.name}.`
          );
        } else {
          this.messageService.customNotification(
            NotificationType.ERROR,
            `⚠️ Já existe um operador ${existingChat.operator.name} atendendo o cliente ${client.user.name}.`
          );
        }
  
        this.chatService.activeChatRoom.set(existingChat);
        this.chatService.customerSupport.update(prev => {
          if (!prev.some(chat => chat.id === existingChat.id)) {
            return [...prev, existingChat];
          }
          return prev;
        });
        return;
      }
  
      // 👉 Só chega aqui se realmente pode iniciar atendimento
      this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          title: `Deseja realizar o atendimento de ${client.user.username}?`,
          message: `Assunto referente a <b>${client.occurrency}</b>`,
          typeButtom: 'ok'
        },
      }).afterClosed().subscribe(async (confirmed: boolean) => {
        if (confirmed) {
          try {
            await this.chatService.startChatWithClient(client, this.currentUser);
            console.log(`Atendimento iniciado para: ${client.user.username}`);
          } catch (error) {
            console.error('Erro ao iniciar atendimento:', error);
          }
        }
      });
    } catch (error) {
      console.error("Erro ao verificar chat existente:", error);
    }
  }
  
  
  
  

  isRowActive(clientRow: userChatLogged): boolean {
    if (!this.customerSupport || !this.currentUser) return false;
  
    // Ativo = cliente atendido pelo operador logado
    return this.customerSupport.some(chat =>
      chat.client?.id === clientRow.user.id &&
      chat.operator?.id === this.currentUser.id
    );
  }
  
  isRowBusyByOther(clientRow: userChatLogged): boolean {
    if (!this.customerSupport || !this.currentUser) return false;
  
    // Em vermelho = cliente já atendido por outro operador
    return this.customerSupport.some(chat =>
      chat.client?.id === clientRow.user.id &&
      chat.operator?.id !== this.currentUser.id
    );
  }

}
