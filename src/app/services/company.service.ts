import { inject, Injectable } from '@angular/core';
import { Company, User } from '../models/models';
import {
  addDoc, collection, doc, Firestore, updateDoc,
  query, where, getDocs, orderBy,
  collectionData
} from '@angular/fire/firestore';
import { SendNotificationService } from './send-notification.service';
import { NotificationType } from '../enums/notificationType.enum';
import { DateTimeFormatPipe } from '../pipes/dateTimeFormatTimeStamp.pipe';
import { Observable } from 'rxjs';
import { deleteDoc } from 'firebase/firestore';

const PATH = 'company';
const HELP_DESK_COMPANY = 'helpCompanies';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private _firestore = inject(Firestore);
  private _collection = collection(this._firestore, PATH);
  private dateTimePipe = new DateTimeFormatPipe();


  constructor(private messageService: SendNotificationService) { }


  private formatCompanyDates(company: Company): Company {
    const formattedCompany = { ...company };

    if (company.created) {
      formattedCompany.created = this.dateTimePipe.transform(company.created);
    }

    if (company.updated) {
      formattedCompany.updated = this.dateTimePipe.transform(company.updated);
    }

    return formattedCompany;
  }

  async getCompanyByHelpDeskId(helpDeskCompanyId: string): Promise<Company[]> {
    try {
      const q = query(
        collection(this._firestore, PATH),
        where('helpDeskCompanyId', '==', helpDeskCompanyId)
      );

      const querySnapshot = await getDocs(q);

      const companies: Company[] = querySnapshot.docs.map(docSnapshot => {
        const rawCompany = { id: docSnapshot.id, ...docSnapshot.data() } as Company;
        return this.formatCompanyDates(rawCompany);
      });

      return companies;
    } catch (error) {
      console.error('Erro ao buscar empresas por helpDeskCompanyId:', error);
      this.messageService.customNotification(
        NotificationType.ERROR,
        'Erro ao buscar empresas pelo Help Desk ID'
      );
      return [];
    }
  }

  async getCompanyById(companyId: string): Promise<Company | null> {
    try {
      const docSnapshot = await getDocs(
        query(collection(this._firestore, HELP_DESK_COMPANY), where('id', '==', companyId))
      );

      if (!docSnapshot.empty) {
        const companyData = docSnapshot.docs[0].data();
        const company = { id: companyId, ...companyData } as Company;
        return this.formatCompanyDates(company);
      } else {
        console.warn(`Empresa com ID ${companyId} não encontrada.`);
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar empresa pelo ID:', error);
      this.messageService.customNotification(
        NotificationType.ERROR,
        'Erro ao buscar empresa pelo ID'
      );
      throw error;
    }
  }

  async fetchClientsByCompanyId(companyId: string): Promise<User[]> {
    try {
      const clientsCollection = collection(this._firestore, 'clients');
      const clientsQuery = query(clientsCollection, where('companyId', '==', companyId));
      const querySnapshot = await getDocs(clientsQuery);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data(); // Obtem os dados do documento
        return {
          id: doc.id,
          ...data, // Garante que as propriedades sejam mescladas
        } as any as User;
      });
    } catch (error) {
      console.error('Erro ao buscar clientes pelo companyId:', error);
      this.messageService.customNotification(NotificationType.ERROR, 'Erro ao buscar clientes pelo companyId');
      throw error;
    }
  }

  getCompanyByFirebase(helpDeskCompanyId?: string): Observable<Company[]> {
    let companyQuery;

    if (helpDeskCompanyId) {
      // Se foi passado um helpDeskCompanyId, filtra por esse campo
      companyQuery = query(
        this._collection,
        where('helpDeskCompanyId', '==', helpDeskCompanyId),
        orderBy('name', 'asc')
      );
    } else {
      // Se não foi passado parâmetro, retorna todas as empresas ordenadas
      companyQuery = query(this._collection, orderBy('name', 'asc'));
    }

    return collectionData(companyQuery, { idField: 'id' }) as Observable<Company[]>;
  }

  // No CompanyService, adicione este método:
  // No CompanyService, modifique o método createCompany:
  async createCompany(companyData: Partial<Company>): Promise<Company> {
    try {
      // Adiciona timestamps como Date
      const companyWithTimestamps = {
        ...companyData,
        created: new Date(),
        updated: new Date()
      };

      const docRef = await addDoc(this._collection, companyWithTimestamps);

      // Converte as datas para string antes de retornar
      const newCompany = {
        id: docRef.id,
        ...companyWithTimestamps,
        created: companyWithTimestamps.created.toISOString(), // Converte para string
        updated: companyWithTimestamps.updated.toISOString()  // Converte para string
      } as Company;

      this.messageService.customNotification(
        NotificationType.SUCCESS,
        'Empresa criada com sucesso'
      );

      return this.formatCompanyDates(newCompany);
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      this.messageService.customNotification(
        NotificationType.ERROR,
        'Erro ao criar empresa'
      );
      throw error;
    }
  }

  async deleteCompany(companyId: string): Promise<void> {
    try {
      const companyDocRef = doc(this._firestore, `${PATH}/${companyId}`);
      await deleteDoc(companyDocRef);

      this.messageService.customNotification(
        NotificationType.SUCCESS,
        'Empresa deletada com sucesso'
      );
    } catch (error) {
      console.error('Erro ao deletar empresa:', error);
      this.messageService.customNotification(
        NotificationType.ERROR,
        'Erro ao deletar empresa'
      );
      throw error;

    }
  }

  async updateCompany(companyId: string, companyData: Partial<Company>): Promise<Company> {
    try {
      const companyDocRef = doc(this._firestore, `${PATH}/${companyId}`);
  
      // Remove campos que não devem ser sobrescritos
      const { id, created, ...safeData } = companyData;
  
      // Garante que o campo updated seja sempre atualizado
      const updatedData: any = {
        ...safeData,
        updated: new Date()
      };
  
      // Atualiza no Firestore
      await updateDoc(companyDocRef, updatedData);
  
      // Monta o objeto atualizado para retorno
      const updatedCompany: Company = {
        id: companyId,
        ...safeData,
        updated: updatedData.updated.toISOString() // força string
      } as Company;
  
      this.messageService.customNotification(
        NotificationType.SUCCESS,
        'Empresa atualizada com sucesso'
      );
  
      return this.formatCompanyDates(updatedCompany);
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      this.messageService.customNotification(
        NotificationType.ERROR,
        'Erro ao atualizar empresa'
      );
      throw error;
    }
  }


}
