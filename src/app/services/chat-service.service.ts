import { inject, Injectable, signal } from '@angular/core';
import {
  addDoc,
  collection,
  Firestore,
  getDocs,
  query,
  updateDoc,
  where,
  deleteDoc,
  onSnapshot,
} from '@angular/fire/firestore';
import { CompanyService } from './company.service';
import { MatDialog } from '@angular/material/dialog';
import { ChatRoom, Message, User, userChatLogged } from '../models/models';
import { OccurrenceModalComponent } from '../pages/chat/occurrence-modal/occurrence-modal.component';
import { BehaviorSubject } from 'rxjs';
import { arrayUnion, doc, getDoc, setDoc } from 'firebase/firestore';
import { SendNotificationService } from './send-notification.service';
import { NotificationType } from '../enums/notificationType.enum';

const PATH_USERS_CHAT_LOGGED = 'users_chat_logged';
const PATH_USERS = 'users';
const PATH_CLIENTS = 'clients';
const PATH_CHATS_ROOM = 'chat_room';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  operators = signal<User[]>([]);
  clientWaitingList = signal<userChatLogged[]>([]);
  activeChatRoom = signal<ChatRoom | null>(null);
  customerSupport = signal<ChatRoom[]>([]);


  private activeMessagesSubject = new BehaviorSubject<Message[]>([]);
  activeMessages$ = this.activeMessagesSubject.asObservable();

  private _firestore = inject(Firestore);
  private _usersLoggedCollection = collection(this._firestore, PATH_USERS_CHAT_LOGGED);
  private _users = collection(this._firestore, PATH_USERS);
  private _clients = collection(this._firestore, PATH_CLIENTS);
  private _chatRooms = collection(this._firestore, PATH_CHATS_ROOM);

  constructor(
    private companyService: CompanyService,
    private dialog: MatDialog,
    private messageService: SendNotificationService,
  ) { }

  // Atualiza sinais em tempo real
  initializeOperators(): void {
    try {
      onSnapshot(this._usersLoggedCollection, (snapshot) => {
        const usersChatLogged = snapshot.docs.map(doc => doc.data() as userChatLogged);

        const operators: User[] = [];
        const clients: userChatLogged[] = [];

        usersChatLogged.forEach(entry => {
          const user = entry.user;
          if (user.roles?.includes('OPERATOR')) {
            operators.push(user);
          }
          if (user.roles?.includes('CLIENT')) {
            clients.push(entry);
          }
        });

        this.operators.set(operators);
        this.clientWaitingList.set(clients);

        console.log('📡 Atualizado em tempo real -> Operators:', operators, 'Clients:', clients);
      });
    } catch (error) {
      console.error('Erro ao inicializar operadores:', error);
    }
  }

  getOperators(): User[] {
    return this.operators();
  }

  getClientWaitingList(): userChatLogged[] {
    return this.clientWaitingList();
  }

  async loadCustomerSupport(operatorId: string): Promise<void> {
    try {
      const q = query(this._chatRooms, where('operator.id', '==', operatorId));
      const snapshot = await getDocs(q);

      const chats: ChatRoom[] = snapshot.docs.map((doc) => doc.data() as ChatRoom);

      this.customerSupport.set(chats);
      console.log('📌 customerSupport carregado:', chats);
    } catch (error) {
      console.error('Erro ao carregar customerSupport:', error);
    }
  }

  async logUserInChat(user: User): Promise<userChatLogged> {
    try {
      let occurrency: string | undefined;

      // Se for cliente, abre modal para informar ocorrência
      if (user.roles?.includes('CLIENT')) {
        occurrency = await this.dialog.open(OccurrenceModalComponent, {
          width: '400px',
          disableClose: true,
          data: { user },
        }).afterClosed().toPromise();

        if (!occurrency) {
          throw new Error('Ocorrência obrigatória não informada!');
        }
      }

      // Cria objeto do tipo userChatLogged
      const userChatLogged: userChatLogged = {
        user: {
          ...user,
          isLoggedIn: true,
        },
        ...(occurrency ? { occurrency } : {}),
        date: new Date()
      };

      // 👉 Verifica se usuário já existe no Firestore
      const userQuery = query(this._usersLoggedCollection, where('user.id', '==', user.id));
      const snapshot = await getDocs(userQuery);

      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        await updateDoc(userDoc.ref, userChatLogged as any);
      } else {
        await addDoc(this._usersLoggedCollection, userChatLogged as any);
      }

      // Atualiza signals internos
      this.updateSignals(userChatLogged.user);

      // ✅ Retorna o objeto tipado corretamente
      return userChatLogged;
    } catch (error) {
      console.error('Erro ao logar usuário no chat:', error);
      throw error;
    }
  }



  updateSignals(user: User, occurrency?: string): void {
    if (user.roles?.includes('OPERATOR')) {
      this.addToSignalUser(this.operators, user);
    } else if (user.roles?.includes('CLIENT')) {
      const entry: userChatLogged = { user, occurrency, date: new Date() };
      this.addToSignalClient(this.clientWaitingList, entry);
    }
  }

  private addToSignalUser(signalToUpdate: ReturnType<typeof signal<User[]>>, user: User): void {
    const currentList = signalToUpdate();
    if (!currentList.some((u) => u.id === user.id)) {
      signalToUpdate.set([...currentList, user]);
    }
  }

  private addToSignalClient(signalToUpdate: ReturnType<typeof signal<userChatLogged[]>>, entry: userChatLogged): void {
    const currentList = signalToUpdate();
    if (!currentList.some((e) => e.user.id === entry.user.id)) {
      signalToUpdate.set([...currentList, entry]);
    }
  }

  async logUserOutChat(user: User): Promise<void> {
    try {
      console.log(`Iniciando logout para usuário: ${user.id}`);

      // 1. Remove usuário da coleção logada
      const loggedQuery = query(this._usersLoggedCollection, where('user.id', '==', user.id));
      const loggedSnapshot = await getDocs(loggedQuery);

      if (!loggedSnapshot.empty) {
        const userDoc = loggedSnapshot.docs[0];
        await deleteDoc(userDoc.ref);
        console.log(`Usuário removido de ${PATH_USERS_CHAT_LOGGED}`);
      }

      // 2. Atualiza no users
      const usersQuery = query(this._users, where('id', '==', user.id));
      const usersSnapshot = await getDocs(usersQuery);
      if (!usersSnapshot.empty) {
        await updateDoc(usersSnapshot.docs[0].ref, { isLoggedIn: false, connection: null });
      }

      // 3. Atualiza no clients
      const clientsQuery = query(this._clients, where('id', '==', user.id));
      const clientsSnapshot = await getDocs(clientsQuery);
      if (!clientsSnapshot.empty) {
        await updateDoc(clientsSnapshot.docs[0].ref, { isLoggedIn: false, connection: null });
      }

      // 4. Remove do signal
      this.removeFromSignals(user.id);
    } catch (error) {
      console.error('Erro ao deslogar usuário no chat:', error);
      throw error;
    }
  }

  private removeFromSignals(userId: string): void {
    this.operators.set(this.operators().filter(op => op.id !== userId));
    this.clientWaitingList.set(this.clientWaitingList().filter(client => client.user.id !== userId));
  }

  async isUserOnline(userId: string): Promise<boolean> {
    try {
      const snapshot = await getDocs(
        query(
          this._usersLoggedCollection,
          where('user.id', '==', userId),
          where('user.isLoggedIn', '==', true)
        )
      );
      return !snapshot.empty;
    } catch (error) {
      console.error('Erro ao verificar se usuário está online:', error);
      return false;
    }
  }

  getUnreadMessagesCount(messages: Message[], currentUserId: string): number {
    return messages.filter(
      (message) => !message.isRead && message.sender !== currentUserId
    ).length;
  }

  getRoomActive(): ChatRoom | null {
    return this.activeChatRoom();
  }

  async updateMessages(chatRoomId: string, newMessage: Message): Promise<void> {
    try {
      const chatDocRef = doc(this._firestore, `${PATH_CHATS_ROOM}/${chatRoomId}`);

      // Atualiza o array de mensagens no Firestore
      await updateDoc(chatDocRef, {
        mensages: arrayUnion(newMessage),
        updated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao atualizar mensagens:', error);
      throw error;
    }
  }

  async fetchMessages(chatRoomId: string): Promise<Message[]> {
    try {
      const chatDocRef = doc(this._firestore, `${PATH_CHATS_ROOM}/${chatRoomId}`);
      const chatDocSnap = await getDoc(chatDocRef);

      if (chatDocSnap.exists()) {
        const chatData = chatDocSnap.data() as ChatRoom;
        return chatData.mensages || [];
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      throw error;
    }
  }

  saveActiveMessage(messages: Message[]): void {
    this.activeMessagesSubject.next(messages); // Atualiza a lista com mensagens mais recentes
  }

  getActiveMessage(): Message[] {
    return this.activeMessagesSubject.value;
  }

  async markMessagesAsRead(chatRoomId: string, currentUserId: string): Promise<void> {
    try {
      const chatDocRef = doc(this._firestore, `${PATH_CHATS_ROOM}/${chatRoomId}`);
      const chatDocSnap = await getDoc(chatDocRef);

      if (chatDocSnap.exists()) {
        const chatData = chatDocSnap.data() as ChatRoom;

        const updatedMessages = chatData.mensages.map((message: Message) => {
          if (!message.isRead && message.sender !== currentUserId) {
            return { ...message, isRead: true };
          }
          return message;
        });

        await updateDoc(chatDocRef, { mensages: updatedMessages });
      }
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
      throw error;
    }
  }

  async startChatWithClient(clientLogged: userChatLogged, operator: User): Promise<void> {
    try {
      const client = clientLogged.user;

      // 👉 Cria um novo chat direto (sem checar duplicação)
      const chatRoomRef = collection(this._firestore, PATH_CHATS_ROOM);
      const newChatRoomRef = doc(chatRoomRef);

      const chatRoom: ChatRoom = {
        id: newChatRoomRef.id,
        close: false,
        created: new Date(),
        updated: null,
        operator,
        client,
        mensages: [],
        unreadCount: 0,
        occurrence: clientLogged.occurrency || ''
      };

      await setDoc(newChatRoomRef, chatRoom);

      console.log('✅ ChatRoom criado com sucesso:', chatRoom);

      this.activeChatRoom.set(chatRoom);
      this.customerSupport.update(prev => [...prev, chatRoom]);

    } catch (error) {
      console.error('Erro ao iniciar chat com cliente:', error);
      throw error;
    }
  }



  async checkExistingChatRoom(clientId: string, operatorId: string): Promise<ChatRoom | null> {
    try {
      const q = query(this._chatRooms, where('client.id', '==', clientId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null; // Nenhum chat encontrado
      }

      const existingRooms = snapshot.docs.map(doc => doc.data() as ChatRoom);

      for (const room of existingRooms) {
        if (!room.close) {
          return room; // 👈 apenas retorna a sala, sem notificação
        }
      }

      return null;
    } catch (error) {
      console.error("Erro ao verificar chat existente:", error);
      throw error;
    }
  }

  async loadAllActiveChats(): Promise<ChatRoom[]> {
    try {
      const q = query(this._chatRooms, where('close', '==', false));
      const snapshot = await getDocs(q);
  
      const chats: ChatRoom[] = snapshot.docs.map((doc) => doc.data() as ChatRoom);
  
      console.log('📌 Todos os chats ativos:', chats);
      return chats;
    } catch (error) {
      console.error('Erro ao carregar todos os chats ativos:', error);
      return [];
    }
  }
  


}
