import { inject, Injectable, signal } from '@angular/core';
import { Firestore, collection, query, where, getDocs, CollectionReference } from '@angular/fire/firestore';
import { User } from '../models/models';
import { SessionService } from './session.service';
import { LayoutService } from './layout.service';

const PATH_USERS = 'users';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _firestore = inject(Firestore);
  private _collection: CollectionReference = collection(this._firestore, PATH_USERS);

  // Signal para o estado de autenticação e usuário logado
  loggedIn = signal(false);
  currentUser = signal<User | null>(null);

  constructor(private layoutService: LayoutService, private sessionService: SessionService) {
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
      const userQuery = query(
        this._collection,
        where('email', '==', email),
        where('password', '==', password)
      );
  
      const querySnapshot = await getDocs(userQuery);
  
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const user = userDoc.data() as User;
        user.id = userDoc.id; // opcional, se quiser o ID
  
        // Salva a sessão local
        this.sessionService.setSession(user);
        this.loggedIn.set(true);
        this.currentUser.set(user);
        this.layoutService.setShowSideNav(true);
  
        return true;
      } else {
        throw new Error('Usuário ou senha inválidos.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
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
