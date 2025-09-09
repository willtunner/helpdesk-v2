import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, query, where, getDocs, getDoc, arrayUnion, onSnapshot } from '@angular/fire/firestore';
import { BehaviorSubject, } from 'rxjs';
import { ChatRoom, Company, HelpDeskCompany, Message, User } from '../models/models';
import { CompanyService } from './company.service';
import { UserType } from '../enums/user-types.enum';
import { SendNotificationService } from './send-notification.service';
import { NotificationType } from '../enums/notificationType.enum';
import { orderBy } from 'firebase/firestore';

const PATH_USERS = 'users';
const PATH_CLIENTS = 'clients';
const PATH_USERS_CHAT_LOGGED = 'users_chat_logged';
const PATH_CHATS_ROOM = 'chat_room';
const PATH_HELP_COMPANY = 'helpCompanies';


@Injectable({
  providedIn: 'root',
})
export class UserService {


  private _firestore = inject(Firestore);
  private _usersCollection = collection(this._firestore, PATH_USERS);
  private _chatsRoomCollection = collection(this._firestore, PATH_CHATS_ROOM);
  private _usersLoggedCollection = collection(this._firestore, PATH_USERS_CHAT_LOGGED);
  private _usersClientCollection = collection(this._firestore, PATH_CLIENTS);
  private _helpCompaniesCollection = collection(this._firestore, PATH_HELP_COMPANY);

  public activeChatRoom = signal<ChatRoom | null>(null);
  private activeMessagesSubject = new BehaviorSubject<Message[]>([]);
  activeMessages$ = this.activeMessagesSubject.asObservable();

  constructor(private companyService: CompanyService,
    private messageService: SendNotificationService,
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

  getEffectiveUserRole(user: User, company?: HelpDeskCompany): UserType {
    if (!user) {
      throw new Error('Usuário inválido.');
    }
  
    // Roles diretas do usuário
    const userRoles = Array.isArray(user.roles) ? user.roles.map(r => r.toLowerCase()) : [];
  
    // Roles vindas da empresa (caso o usuário esteja vinculado a ela)
    const companyRoles = company?.roles?.map(r => r.toLowerCase()) ?? [];
  
    // Combina ambas (user + empresa)
    const roles = [...new Set([...userRoles, ...companyRoles])] as UserType[];
  
    if (roles.length === 0) {
      throw new Error('Usuário deve ter ao menos uma role válida.');
    }
  
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

  async getUserWithHelpDeskCompany(userId: string): Promise<User | null> {
    try {
      const user = await this.getUserById(userId);
  
      if (!user) {
        console.warn(`Usuário ${userId} não encontrado.`);
        return null;
      }
  
      // Se o usuário tem helpDeskCompanyId, buscar a empresa
      if (user.helpDeskCompanyId) {
        const helpDeskQuery = query(
          this._helpCompaniesCollection,
          where('id', '==', user.helpDeskCompanyId)
        );
  
        const helpDeskSnapshot = await getDocs(helpDeskQuery);
  
        if (!helpDeskSnapshot.empty) {
          const helpDeskDoc = helpDeskSnapshot.docs[0];
          const helpDeskCompany = {
            id: helpDeskDoc.id,
            ...helpDeskDoc.data(),
          } as HelpDeskCompany;
  
          return {
            ...user,
            helpDeskCompany,
          } as User;
        }
      }
  
      // Caso não tenha helpDeskCompanyId ou não encontrado
      return {
        ...user,
        helpDeskCompany: null,
      } as User;
  
    } catch (error) {
      console.error('Erro ao buscar usuário com HelpDeskCompany:', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      // Determina em qual coleção buscar (users ou clients)
      let userDocRef: any = null;
      let collectionPath = PATH_USERS;

      // Verifica se o usuário existe na coleção 'users'
      const userQuery = query(this._usersCollection, where('id', '==', userId));
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        // Se não encontrou em 'users', verifica na coleção 'clients'
        const clientQuery = query(this._usersClientCollection, where('id', '==', userId));
        const clientSnapshot = await getDocs(clientQuery);
        
        if (!clientSnapshot.empty) {
          collectionPath = PATH_CLIENTS;
          userDocRef = doc(this._firestore, `${PATH_CLIENTS}/${clientSnapshot.docs[0].id}`);
        } else {
          throw new Error('Usuário não encontrado');
        }
      } else {
        userDocRef = doc(this._firestore, `${PATH_USERS}/${userSnapshot.docs[0].id}`);
      }

      // Remove campos que não devem ser atualizados
      const { id, created, helpDeskCompany, company, ...safeData } = userData;

      // Prepara dados para atualização
      const updateData: any = {
        ...safeData,
        updated: new Date()
      };

      // Atualiza no Firestore
      await updateDoc(userDocRef, updateData);

      // Busca o usuário atualizado para retornar
      const updatedUser = await this.getUserById(userId);
      
      if (!updatedUser) {
        throw new Error('Erro ao buscar usuário atualizado');
      }

      this.messageService.customNotification(
        NotificationType.SUCCESS,
        'Usuário atualizado com sucesso'
      );

      return updatedUser;

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      this.messageService.customNotification(
        NotificationType.ERROR,
        'Erro ao atualizar usuário'
      );
      throw error;
    }
  }

  async getUsersByHelpDeskCompanyIdOrdered(helpDeskCompanyId: string): Promise<User[]> {
    try {
      console.log(`Buscando usuários ordenados com helpDeskCompanyId: ${helpDeskCompanyId}`);
      
      // Cria a query com ordenação por nome
      const usersQuery = query(
        this._usersCollection,
        where('helpDeskCompanyId', '==', helpDeskCompanyId),
        orderBy('name', 'asc')
      );

      // Executa a query
      const querySnapshot = await getDocs(usersQuery);

      // Mapeia os documentos para objetos User completos
      const users: User[] = querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        
        return {
          id: docSnapshot.id,
          name: data['name'] || '',
          email: data['email'] || '',
          phone: data['phone'] || '',
          username: data['username'] || '',
          password: data['password'] || '',
          roles: data['roles'] || [],
          imageUrl: data['imageUrl'] || '',
          helpDeskCompanyId: data['helpDeskCompanyId'] || '',
          companyId: data['companyId'] || '',
          deleted: data['deleted'] !== undefined ? data['deleted'] : false,
          isLoggedIn: data['isLoggedIn'] !== undefined ? data['isLoggedIn'] : false,
          created: data['created'] ? new Date(data['created']) : new Date(),
          updated: data['updated'] ? new Date(data['updated']) : null,
          connection: data['connection'] || null,
          helpDeskCompany: data['helpDeskCompany'] || null,
          company: data['company'] || null,
        } as User;
      });

      console.log(`Encontrados ${users.length} usuários ordenados para o helpDeskCompanyId: ${helpDeskCompanyId}`);
      
      return users;

    } catch (error) {
      console.error('Erro ao buscar usuários ordenados por helpDeskCompanyId:', error);
      this.messageService.customNotification(
        NotificationType.ERROR,
        'Erro ao buscar usuários da empresa'
      );
      return [];
    }
  }

  async saveOperator(userData: Partial<User>): Promise<User> {
    try {
      // Gera um novo doc em "users"
      const userDocRef = await addDoc(this._usersCollection, {
        ...userData,
        deleted: false,
        created: new Date(),
        updated: null,
      });
  
      const savedUser: User = {
        id: userDocRef.id,
        deleted: false,
        created: new Date(),
        updated: null,
        username: userData.username ?? '',
        name: userData.name ?? '',
        phone: userData.phone ?? '',
        email: userData.email ?? '',
        password: userData.password ?? '',
        isLoggedIn: false,
        imageUrl: userData.imageUrl ?? '',
        roles: userData.roles ?? ['OPERATOR'],
        connection: userData.connection ?? null,
        helpDeskCompanyId: userData.helpDeskCompanyId ?? '',
        companyId: userData.companyId ?? '',
      };
  
      this.messageService.customNotification(
        NotificationType.SUCCESS,
        'Operador cadastrado com sucesso'
      );
  
      return savedUser;
    } catch (error) {
      console.error('Erro ao salvar operador:', error);
      this.messageService.customNotification(
        NotificationType.ERROR,
        'Erro ao cadastrar operador'
      );
      throw error;
    }
  }
  
  
  
}
