import { inject, Injectable } from '@angular/core';
import { User } from '../models/models';
import { collection, Firestore,
  query, where, getDocs, orderBy, } from '@angular/fire/firestore';
import { SendNotificationService } from './send-notification.service';
import { DateTimeFormatPipe } from '../pipes/dateTimeFormatTimeStamp.pipe';
import { NotificationType } from '../enums/notificationType.enum';

const PATH = 'clients';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private _firestore = inject(Firestore);
  private _collection = collection(this._firestore, PATH);
  // private dateTimePipe = new DateTimeFormatPipe();

  constructor(private messageService: SendNotificationService) { }

  
  getClientsByCompanyId(companyId: string): Promise<User[]> {
    const q = query(
      this._collection,
      where('companyId', '==', companyId)
    );
  
    return getDocs(q).then(snapshot => {
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    });
  }

  async getClientById(clientId: string): Promise<User | null> {
    try {
        const q = query(
            this._collection,
            where('id', '==', clientId)
        );
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as User;
        } else {
            console.warn(`Cliente com ID ${clientId} não encontrado.`);
            return null;
        }
    } catch (error) {
        console.error('Erro ao buscar cliente por ID:', error);
        this.messageService.customNotification(NotificationType.ERROR, 'Erro ao buscar cliente');
        throw error;
    }
}


}
