import { inject, Injectable } from '@angular/core';
import { doc, Firestore, getDoc, collection, addDoc, updateDoc } from '@angular/fire/firestore';
import { SendNotificationService } from './send-notification.service';
import { User } from '../models/models';
import { AuthService } from './auth.service';
import { NotificationType } from '../enums/notificationType.enum';
import { SessionService } from './session.service';

const PATH_OPERATOR = 'users';
const PATH_HELP_COMPANY = 'helpCompanies';

@Injectable({
  providedIn: 'root',
})
export class OperatorsService {
  private _firestore = inject(Firestore);
  private _usersCollection = collection(this._firestore, PATH_OPERATOR);
  private _helpCompaniesCollection = collection(this._firestore, PATH_HELP_COMPANY);

  constructor(
    private messageService: SendNotificationService,
    private authService: AuthService, private sessionService: SessionService) { }

  async getUserById(userId: string): Promise<User | null> {
    try {
      // Referência ao documento do usuário
      const userDocRef = doc(this._firestore, `${PATH_OPERATOR}/${userId}`);

      // Busca o documento no Firestore
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        // Converte os dados do documento para o tipo `User`
        const userData = userSnapshot.data() as User;
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
