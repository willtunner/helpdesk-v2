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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _firestore = inject(Firestore);
  private _usersCollection: CollectionReference = collection(this._firestore, PATH_USERS);
  private _clientsCollection: CollectionReference = collection(this._firestore, PATH_CLIENTS);

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
    try {
      // 🔍 Procura primeiro em USERS
      const usersQuery = query(
        this._usersCollection,
        where('email', '==', email),
        where('password', '==', password)
      );
      const usersSnap = await getDocs(usersQuery);

      // 🔍 Depois procura em CLIENTS
      const clientsQuery = query(
        this._clientsCollection,
        where('email', '==', email),
        where('password', '==', password)
      );
      const clientsSnap = await getDocs(clientsQuery);

      // 📌 Verifica duplicados
      const totalMatches = usersSnap.size + clientsSnap.size;
      if (totalMatches > 1) {
        throw new Error('E-mail duplicado encontrado em mais de uma conta.');
      }

      // ✅ Se achou em users
      if (!usersSnap.empty) {
        const userDoc = usersSnap.docs[0];
        const user = userDoc.data() as User;
        user.id = userDoc.id;

        this._saveSession(user);
        return true;
      }

      // ✅ Se achou em clients
      if (!clientsSnap.empty) {
        const clientDoc = clientsSnap.docs[0];
        const client = clientDoc.data() as User; // se tiver interface diferente, cria Client
        client.id = clientDoc.id;

        this._saveSession(client);
        return true;
      }

      // ❌ Nenhum encontrado
      throw new Error('Usuário ou senha inválidos.');
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
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
