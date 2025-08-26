import { inject, Injectable, signal } from '@angular/core';
import { addDoc, collection, Firestore, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { CompanyService } from './company.service';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../models/models';
import { deleteDoc, onSnapshot } from 'firebase/firestore';

const PATH_USERS_CHAT_LOGGED = 'users_chat_logged';
const PATH_USERS = 'users';
const PATH_CLIENTS = 'clients';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  operators = signal<User[]>([]);
  clientWaitingList = signal<User[]>([]);

  private _firestore = inject(Firestore);
  private _usersLoggedCollection = collection(this._firestore, PATH_USERS_CHAT_LOGGED);
  private _users = collection(this._firestore, PATH_USERS);
  private _clients = collection(this._firestore, PATH_CLIENTS);

  constructor(
    private companyService: CompanyService,
    private dialog: MatDialog
  ) { }

  // Inicializa o estado com dados do Firebase e faz a verificação de roles
  initializeOperators(): void {
    try {
      onSnapshot(this._usersLoggedCollection, (snapshot) => {
        const users = snapshot.docs.map(doc => doc.data() as User);
  
        const operators: User[] = [];
        const clients: User[] = [];
  
        users.forEach(user => {
          if (user.roles?.includes('OPERATOR')) {
            operators.push(user);
          }
          if (user.roles?.includes('CLIENT')) {
            clients.push(user);
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

  // Retorna os operadores
  getOperators(): any[] {
    return this.operators();
  }

  // Retorna a lista de clientes em espera
  getClientWaitingList(): any[] {
    return this.clientWaitingList();
  }

  // Adiciona ou atualiza um usuário no Firebase e no estado
  async logUserInChat(user: User): Promise<User> {
    try {
      const userQuery = query(this._usersLoggedCollection, where('id', '==', user.id));
      const snapshot = await getDocs(userQuery);

      let updatedUser: User = {
        ...user,
        isLoggedIn: true,
        connection: Date.now().toString(), // 👈 se connection é string (pelo seu model)
      };

      if (!snapshot.empty) {
        // Atualiza o usuário existente
        const userDoc = snapshot.docs[0];
        await updateDoc(userDoc.ref, updatedUser as any);
      } else {
        // Adiciona um novo usuário
        await addDoc(this._usersLoggedCollection, updatedUser as any);
      }

      // Atualiza o estado local
      this.updateSignals(updatedUser);

      return updatedUser; // 👈 retorna o objeto atualizado
    } catch (error) {
      console.error('Erro ao logar usuário no chat:', error);
      throw error; // 👈 propaga o erro para quem chamar a função
    }
  }


  // Atualiza os sinais com base na role do usuário
  updateSignals(user: User): void {
    if (user.roles?.includes('OPERATOR')) {
      this.addToSignal(this.operators, user);
    } else if (user.roles?.includes('CLIENT')) {
      this.addToSignal(this.clientWaitingList, user);
    }
  }

  // Adiciona um usuário a um sinal, evitando duplicação
  private addToSignal(signalToUpdate: ReturnType<typeof signal<User[]>>, user: User): void {
    const currentList = signalToUpdate();
    const exists = currentList.some((u: User) => u.id === user.id); // Adicionada a tipagem explícita para 'u'

    if (!exists) {
      currentList.push(user);
      signalToUpdate.set(currentList);
    }
  }


  async logUserOutChat(user: User): Promise<void> {
    try {
      console.log(`Iniciando logout para usuário: ${user.id}`);

      // 1. Remove usuário da coleção de logados
      const loggedQuery = query(this._usersLoggedCollection, where('id', '==', user.id));
      const loggedSnapshot = await getDocs(loggedQuery);

      if (!loggedSnapshot.empty) {
        const userDoc = loggedSnapshot.docs[0];
        await deleteDoc(userDoc.ref);
        console.log(`Usuário removido da coleção ${PATH_USERS_CHAT_LOGGED}`);
      }

      // 2. Atualiza usuário na coleção users (se existir)
      const usersQuery = query(this._users, where('id', '==', user.id));
      const usersSnapshot = await getDocs(usersQuery);

      if (!usersSnapshot.empty) {
        const userDoc = usersSnapshot.docs[0];
        await updateDoc(userDoc.ref, { 
          isLoggedIn: false,
          connection: null 
        });
        console.log(`Usuário atualizado na coleção ${PATH_USERS}`);
      }

      // 3. Atualiza usuário na coleção clients (se existir)
      const clientsQuery = query(this._clients, where('id', '==', user.id));
      const clientsSnapshot = await getDocs(clientsQuery);

      if (!clientsSnapshot.empty) {
        const clientDoc = clientsSnapshot.docs[0];
        await updateDoc(clientDoc.ref, { 
          isLoggedIn: false,
          connection: null 
        });
        console.log(`Usuário atualizado na coleção ${PATH_CLIENTS}`);
      }

      // 4. Atualiza os sinais locais removendo o usuário
      this.removeFromSignals(user.id);

      console.log(`Logout concluído para usuário: ${user.id}`);

    } catch (error) {
      console.error('Erro ao deslogar usuário no chat:', error);
      throw error;
    }
  }

  // Método para remover usuário dos sinais locais
  private removeFromSignals(userId: string): void {
    // Remove dos operadores
    const currentOperators = this.operators();
    const updatedOperators = currentOperators.filter(op => op.id !== userId);
    this.operators.set(updatedOperators);

    // Remove da lista de espera
    const currentClients = this.clientWaitingList();
    const updatedClients = currentClients.filter(client => client.id !== userId);
    this.clientWaitingList.set(updatedClients);
  }

  // Verifica se o usuário está logado no chat
  async isUserOnline(userId: string): Promise<boolean> {
    try {
      const snapshot = await getDocs(
        query(this._usersLoggedCollection,
          where('id', '==', userId),
          where('isLoggedIn', '==', true)
        )
      );
      return !snapshot.empty;
    } catch (error) {
      console.error('Erro ao verificar se usuário está online:', error);
      return false;
    }
  }

}
