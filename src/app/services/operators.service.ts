import { inject, Injectable } from '@angular/core';
import { doc, Firestore, getDoc, collection, addDoc, updateDoc } from '@angular/fire/firestore';
import { SendNotificationService } from './send-notification.service';
import { User, UserClient } from '../models/models';
import { AuthService } from './auth.service';
import { NotificationType } from '../enums/notificationType.enum';
import { SessionService } from './session.service';

const PATH_OPERATOR = 'users';

@Injectable({
  providedIn: 'root',
})
export class OperatorsService {
  private _firestore = inject(Firestore);
  private _usersCollection = collection(this._firestore, PATH_OPERATOR);

  constructor(
    private messageService: SendNotificationService, 
    private authService: AuthService, private sessionService: SessionService) {}

  async getUserById(userId: string): Promise<UserClient | null> {
    try {
      // Referência ao documento do usuário
      const userDocRef = doc(this._firestore, `${PATH_OPERATOR}/${userId}`);

      // Busca o documento no Firestore
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        // Converte os dados do documento para o tipo `User`
        const userData = userSnapshot.data() as UserClient;
        return userData;
      } else {
        console.warn(`Usuário com ID ${userId} não encontrado.`);
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  async saveOperator(operator: Omit<User, 'id'>): Promise<User> {
    const operatorData: Omit<User, 'id'> = {
      ...operator,
      created: new Date(), // Campo obrigatório, inicializa com a data atual
      deleted: false, // Campo obrigatório
      updated: null, // Inicializa como null
      phone: operator.phone || '', // Campo obrigatório, fallback para vazio
      connection: operator.connection || null, // Opcional
      userId: operator.userId || '', // Campo obrigatório, precisa ser preenchido
      imageUrl: operator.imageUrl || '', // Campo obrigatório, fallback para vazio
      roles: operator.roles || ['OPERATOR'], // Campo obrigatório, default para OPERATOR
    };
  
    console.log('Dados do operador a serem salvos:', operatorData);
    try {
      const docRef = await addDoc(this._usersCollection, operatorData);
      const newOperator: User = { ...operatorData, id: docRef.id };
      await updateDoc(docRef, { id: docRef.id });
  
      this.messageService.customNotification(
        NotificationType.SUCCESS,
        `${newOperator.username} cadastrado com sucesso!`
      );
  
      return newOperator;
    } catch (error) {
      this.messageService.customNotification(
        NotificationType.ERROR,
        'Erro ao salvar o operador no Firebase'
      );
      console.error('Erro ao salvar o operador no Firebase:', error);
      throw error;
    }
  }

  async updateCurrentUser(updatedUser: User): Promise<void> {
    try {
      if (!updatedUser.id) {
        throw new Error('ID do usuário não fornecido.');
      }

      const userDocRef = doc(this._firestore, updatedUser.id);
      await updateDoc(userDocRef, { ...updatedUser });

      // Atualiza o signal do usuário atual
      this.authService.currentUser.set(updatedUser);
      this.sessionService.updateSession(updatedUser);
      console.log('Usuário atualizado com sucesso.');
    } catch (error) {
      console.error('Erro ao atualizar o usuário:', error);
      throw error;
    }
  }
}
