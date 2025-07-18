import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Company } from '../models/models';
import { environment } from '../environments/environment';
import { addDoc, collection, doc, Firestore, updateDoc, 
  query, where, getDocs, orderBy } from '@angular/fire/firestore';
import { SendNotificationService } from './send-notification.service';
import { NotificationType } from '../enums/notificationType.enum';
import { DateTimeFormatPipe } from '../pipes/dateTimeFormatTimeStamp.pipe';

const PATH = 'company';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private _firestore = inject(Firestore);
  private _collection = collection(this._firestore, PATH);
  private dateTimePipe = new DateTimeFormatPipe();

  private apiUrl = `${environment.apiUrl}/company`; // URL base da API

  constructor(private http: HttpClient, private messageService: SendNotificationService) { }

  
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
        query(collection(this._firestore, PATH), where('id', '==', companyId))
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

}
