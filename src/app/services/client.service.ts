import { inject, Injectable } from '@angular/core';
import { Company, User } from '../models/models';
import {
  collection, Firestore,
  query, where, getDocs, orderBy,
} from '@angular/fire/firestore';
import { SendNotificationService } from './send-notification.service';
import { DateTimeFormatPipe } from '../pipes/dateTimeFormatTimeStamp.pipe';
import { NotificationType } from '../enums/notificationType.enum';

const PATH = 'clients';
const PATH_COMPANIES = 'company';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private _firestore = inject(Firestore);
  private _collection = collection(this._firestore, PATH);
  private _companiesCollection = collection(this._firestore, PATH_COMPANIES);
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

  async getCompaniesWithClients(helpDeskCompanyId: string): Promise<Company[]> {
    try {
      // 1. Busca todas as empresas com o helpDeskCompanyId informado
      const companiesQuery = query(
        this._companiesCollection,
        where('helpDeskCompanyId', '==', helpDeskCompanyId)
      );
      
      const companiesSnapshot = await getDocs(companiesQuery);
      
      if (companiesSnapshot.empty) {
        return [];
      }

      // 2. Para cada empresa, busca seus clientes
      const companiesWithClients = await Promise.all(
        companiesSnapshot.docs.map(async (companyDoc) => {
          const companyData = companyDoc.data() as Omit<Company, 'id' | 'clients'>;
          const companyId = companyDoc.id;
          
          // Busca clientes da empresa
          const clients = await this.getClientsByCompanyId(companyId);
          
          // Monta o objeto Company completo
          return {
            id: companyId,
            ...companyData,
            clients: clients,
            helpDeskCompanyId: helpDeskCompanyId
          } as Company;
        })
      );

      return companiesWithClients;
      
    } catch (error) {
      console.error('Erro ao buscar empresas com clientes:', error);
      this.messageService.customNotification(
        NotificationType.ERROR,
        'Erro ao buscar empresas e clientes'
      );
      throw error;
    }
  }



}
