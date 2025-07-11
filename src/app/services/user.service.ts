import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, query, where, getDocs, getDoc, arrayUnion, onSnapshot } from '@angular/fire/firestore';
import { BehaviorSubject, } from 'rxjs';
import { ChatRoom, Company, Message, User } from '../models/models';
import { CompanyService } from './company.service';
import { UserType } from '../enums/user-types.enum';

const PATH_USERS = 'users';
const PATH_CLIENTS = 'clients';
const PATH_USERS_CHAT_LOGGED = 'users_chat_logged';
const PATH_CHATS_ROOM = 'chat_room';


@Injectable({
  providedIn: 'root',
})
export class UserService {


  private _firestore = inject(Firestore);
  private _usersCollection = collection(this._firestore, PATH_USERS);
  private _chatsRoomCollection = collection(this._firestore, PATH_CHATS_ROOM);
  private _usersLoggedCollection = collection(this._firestore, PATH_USERS_CHAT_LOGGED);
  private _usersClientCollection = collection(this._firestore, PATH_CLIENTS);

  public activeChatRoom = signal<ChatRoom | null>(null);
  private activeMessagesSubject = new BehaviorSubject<Message[]>([]);
  activeMessages$ = this.activeMessagesSubject.asObservable();

  constructor(private companyService: CompanyService
    ) { }

  
  async getUserById(userId: string): Promise<User | null> {
    try {
      let userDocData: any = null;
      let userDocId: string | null = null;
  
      // Tenta buscar na coleção 'users'
      const userQuery = query(this._usersCollection, where('id', '==', userId));
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        userDocData = userDoc.data();
        userDocId = userDoc.id;
      } else {
        // Se não encontrou em 'users', tenta na coleção 'clients'
        const clientQuery = query(this._usersClientCollection, where('id', '==', userId));
        const clientSnapshot = await getDocs(clientQuery);
  
        if (!clientSnapshot.empty) {
          const clientDoc = clientSnapshot.docs[0];
          userDocData = clientDoc.data();
          userDocId = clientDoc.id;
        }
      }
  
      // Se encontrou em uma das coleções
      if (userDocData && userDocId) {
        let company: Company | undefined;
  
        if (userDocData.companyId) {
          const foundCompany = await this.companyService.getCompanyById(userDocData.companyId);
          company = foundCompany ?? undefined;
        }
  
        const { id, ...userWithoutId } = userDocData;
  
        return {
          id: userDocId,
          ...userWithoutId,
          company,
        } as User;
      }
  
      // Se não achou em nenhuma das coleções
      return null;
  
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  getEffectiveUserRole(user: User): UserType {
    if (!user || !Array.isArray(user.roles) || user.roles.length === 0) {
      throw new Error('Usuário deve ter ao menos uma role válida.');
    }
  
    const roles = user.roles.map(r => r.toLowerCase()) as UserType[];
  
    // Não permitir OPERATOR e CLIENT juntos
    if (roles.includes(UserType.OPERATOR) && roles.includes(UserType.CLIENT)) {
      throw new Error('Usuário não pode ter as roles OPERATOR e CLIENT simultaneamente.');
    }
  
    const hasOperatorOrClient =
      roles.includes(UserType.OPERATOR) || roles.includes(UserType.CLIENT);
  
    const hasMasterOrAdmin =
      roles.includes(UserType.MASTER) || roles.includes(UserType.ADMIN);
  
    if (hasOperatorOrClient && hasMasterOrAdmin) {
      if (roles.includes(UserType.MASTER)) return UserType.MASTER;
      if (roles.includes(UserType.ADMIN)) return UserType.ADMIN;
    }
  
    // Ordem de prioridade
    const priority: UserType[] = [
      UserType.MASTER,
      UserType.ADMIN,
      UserType.OPERATOR,
      UserType.CLIENT,
    ];
  
    for (const role of priority) {
      if (roles.includes(role)) return role;
    }
  
    throw new Error('Nenhuma role válida foi identificada.');
  }
}

