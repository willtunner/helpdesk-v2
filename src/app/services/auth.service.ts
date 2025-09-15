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
  private _usersCollection: CollectionReference = collection(this._firestore, PATH_USERS);
  private _clientsCollection: CollectionReference = collection(this._firestore, PATH_CLIENTS);
  private _helpDeskClientsCollection: CollectionReference = collection(this._firestore, PATH_HELPDESKS_COMPANIES);

  // Signal para o estado de autenticação e usuário logado
  loggedIn = signal(false);
  currentUser = signal<User | null>(null);

  constructor(
    private layoutService: LayoutService,
    private sessionService: SessionService
  ) {
    const session = this.sessionService.getSession();
    if (session) {
      this.loggedIn.set(true);
      this.currentUser.set(session);
      this.layoutService.setShowSideNav(true);
    } else {
      this.loggedIn.set(false);
      this.currentUser.set(null);
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    console.log('🚀 Tentativa de login iniciada', { email, password });
  
    this._debugCollections(); // Apenas para debug, pode ser removido depois
    
    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.log('🔍 Iniciando login para:', normalizedEmail);
  
      // 🔍 Buscar apenas por EMAIL normalizado nas 3 coleções
      const usersEmailQuery = query(this._usersCollection, where('email', '==', normalizedEmail));
      const clientsEmailQuery = query(this._clientsCollection, where('email', '==', normalizedEmail));
      const helpCompaniesEmailQuery = query(this._helpDeskClientsCollection, where('email', '==', normalizedEmail));
  
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
async _debugCollections() {
  const users = await getDocs(this._usersCollection);
  console.log('🔥 users:', users.docs.map(d => ({ id: d.id, ...d.data() })));

  const clients = await getDocs(this._clientsCollection);
  console.log('🔥 clients:', clients.docs.map(d => ({ id: d.id, ...d.data() })));

  const helpCompanies = await getDocs(this._helpDeskClientsCollection);
  console.log('🔥 helpCompanies:', helpCompanies.docs.map(d => ({ id: d.id, ...d.data() })));
}
  
  

  private _saveSession(user: User) {
    this.sessionService.setSession(user);
    this.loggedIn.set(true);
    this.currentUser.set(user);
    this.layoutService.setShowSideNav(true);
  }

  logout(): void {
    this.sessionService.clearSession();
    this.loggedIn.set(false);
    this.currentUser.set(null);
    this.layoutService.setShowSideNav(false);
  }

  isLoggedIn(): boolean {
    return this.loggedIn();
  }
}
