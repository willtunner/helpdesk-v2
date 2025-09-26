import { inject, Injectable, signal } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  CollectionReference,
} from '@angular/fire/firestore';
import { User } from '../models/models';
import { SessionService } from './session.service';
import { LayoutService } from './layout.service';

const PATH_USERS = 'users';
const PATH_CLIENTS = 'clients';
const PATH_HELPDESKS_COMPANIES = 'helpCompanies';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _firestore = inject(Firestore);
  private _sessionService = inject(SessionService);
  private _layoutService = inject(LayoutService);

  // Signal para o estado de autenticação e usuário logado
  loggedIn = signal(false);
  currentUser = signal<User | null>(null);

  constructor() {
    // Inicialização no constructor deve ser feita após a injeção
    const session = this._sessionService.getSession();
    if (session) {
      this.loggedIn.set(true);
      this.currentUser.set(session);
      this._layoutService.setShowSideNav(true);
    } else {
      this.loggedIn.set(false);
      this.currentUser.set(null);
    }
  }

  // Getters lazy para as coleções - criados apenas quando necessários
  private get _usersCollection(): CollectionReference {
    return collection(this._firestore, PATH_USERS);
  }

  private get _clientsCollection(): CollectionReference {
    return collection(this._firestore, PATH_CLIENTS);
  }

  private get _helpDeskClientsCollection(): CollectionReference {
    return collection(this._firestore, PATH_HELPDESKS_COMPANIES);
  }

  async login(email: string, password: string): Promise<boolean> {
    debugger;
    console.log('🚀 Tentativa de login iniciada', { email, password });
  
    await this._debugCollections(); // Ajustado para await

    try {
      // 🔍 Buscar apenas por EMAIL normalizado nas 3 coleções
      const usersEmailQuery = query(this._usersCollection, where('email', '==', email));
      const clientsEmailQuery = query(this._clientsCollection, where('email', '==', email));
      const helpCompaniesEmailQuery = query(this._helpDeskClientsCollection, where('email', '==', email));
  
      // Executa as consultas em paralelo
      const [usersSnap, clientsSnap, helpCompaniesSnap] = await Promise.all([
        getDocs(usersEmailQuery),
        getDocs(clientsEmailQuery),
        getDocs(helpCompaniesEmailQuery),
      ]);
  
      console.log('📊 Resultados encontrados:');
      console.log('➡️ Users:', usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      console.log('➡️ Clients:', clientsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      console.log('➡️ HelpCompanies:', helpCompaniesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  
      const totalEmailMatches = usersSnap.size + clientsSnap.size + helpCompaniesSnap.size;
  
      // 📌 Caso tenha mais de um email encontrado
      if (totalEmailMatches > 1) {
        throw new Error('E-mail duplicado encontrado em mais de uma conta (users/clients/helpCompanies).');
      }
  
      // 📌 Nenhum email encontrado
      if (totalEmailMatches === 0) {
        throw new Error('E-mail não existe.');
      }
  
      // 📌 Email encontrado em apenas UMA coleção
      let userDoc: any = null;
      let source = '';
  
      if (!usersSnap.empty) {
        userDoc = usersSnap.docs[0];
        source = 'users';
      } else if (!clientsSnap.empty) {
        userDoc = clientsSnap.docs[0];
        source = 'clients';
      } else if (!helpCompaniesSnap.empty) {
        userDoc = helpCompaniesSnap.docs[0];
        source = 'helpCompanies';
      }
  
      const user = userDoc.data() as User;
      user.id = userDoc.id;
  
      console.log(`✅ Usuário encontrado na coleção: ${source}`, user);
  
      // 📌 Valida senha
      if (user.password !== password) {
        throw new Error('Senha incorreta.');
      }
  
      // ✅ Login bem-sucedido
      this._saveSession(user);
      return true;
  
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  }
  
  // Só para debug - pega todos os docs da coleção
  private async _debugCollections() {
    const users = await getDocs(this._usersCollection);
    console.log('🔥 users:', users.docs.map(d => ({ id: d.id, ...d.data() })));

    const clients = await getDocs(this._clientsCollection);
    console.log('🔥 clients:', clients.docs.map(d => ({ id: d.id, ...d.data() })));

    const helpCompanies = await getDocs(this._helpDeskClientsCollection);
    console.log('🔥 helpCompanies:', helpCompanies.docs.map(d => ({ id: d.id, ...d.data() })));
  }
  
  private _saveSession(user: User) {
    this._sessionService.setSession(user);
    this.loggedIn.set(true);
    this.currentUser.set(user);
    this._layoutService.setShowSideNav(true);
  }

  logout(): void {
    this._sessionService.clearSession();
    this.loggedIn.set(false);
    this.currentUser.set(null);
    this._layoutService.setShowSideNav(false);
  }

  isLoggedIn(): boolean {
    return this.loggedIn();
  }
}