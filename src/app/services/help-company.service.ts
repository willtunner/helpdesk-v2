import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc
} from '@angular/fire/firestore';
import { HelpDeskCompany } from '../models/models';
import { SendNotificationService } from './send-notification.service';
import { NotificationType } from '../enums/notificationType.enum';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class HelpCompanyService {
  private _firestore = inject(Firestore);
  private _collection = collection(this._firestore, 'helpCompanies');

  constructor(
    private messageService: SendNotificationService,
    private utilService: UtilService) {}

  async createAccountHelpCompany(data: Partial<HelpDeskCompany>): Promise<HelpDeskCompany> {
    const now = new Date();

    const helpCompany: Omit<HelpDeskCompany, 'id'> = {
      ...data,
      keywords: this.utilService.generateKeywordsFromName(data.name || ''),
      created: now,
      updated: now,
      cnpj: Number(data.cnpj),
      zipcode: Number(String(data.zipcode).replace(/\D/g, '')),
      phone: Number(String(data.phone).replace(/\D/g, '')),
      companies: [],
      employees: []
    } as HelpDeskCompany;

    // Adiciona ao Firestore
    const docRef = await addDoc(this._collection, helpCompany);

    // Atualiza o documento com o ID gerado
    await updateDoc(docRef, { id: docRef.id });

    // Retorna a empresa com o ID incluso
    return {
      ...helpCompany,
      id: docRef.id
    };
  }

  async getHelpCompanyById(id: string): Promise<HelpDeskCompany | null> {
    try {
      const docRef = doc(this._firestore, `helpCompanies/${id}`);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        return docSnap.data() as HelpDeskCompany;
      } else {
        this.messageService.customNotification(NotificationType.ERROR, 'Empresa não encontrada');
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar empresa por ID:', error);
      this.messageService.customNotification(NotificationType.ERROR, 'Erro ao buscar empresa');
      return null;
    }
  }

  async updateHelpCompany(companyId: string, companyData: Partial<HelpDeskCompany>): Promise<HelpDeskCompany> {
    try {
      const companyDocRef = doc(this._firestore, `helpCompanies/${companyId}`);

      // Remove campos que não devem ser atualizados
      const { id, created, companies, employees, ...safeData } = companyData;

      // Prepara dados para atualização
      const updateData: any = {
        ...safeData,
        updated: new Date()
      };

      // Se name foi alterado, atualiza keywords
      if (safeData.name) {
        updateData.keywords = this.utilService.generateKeywordsFromName(safeData.name);
      }

      // Converte campos numéricos se necessário
      if (safeData.cnpj !== undefined) {
        updateData.cnpj = Number(safeData.cnpj);
      }

      if (safeData.zipcode !== undefined) {
        updateData.zipcode = Number(String(safeData.zipcode).replace(/\D/g, ''));
      }

      if (safeData.phone !== undefined) {
        updateData.phone = Number(String(safeData.phone).replace(/\D/g, ''));
      }

      // Atualiza no Firestore
      await updateDoc(companyDocRef, updateData);

      // Busca a empresa atualizada para retornar
      const updatedCompany = await this.getHelpCompanyById(companyId);
      
      if (!updatedCompany) {
        throw new Error('Erro ao buscar empresa atualizada');
      }

      this.messageService.customNotification(
        NotificationType.SUCCESS,
        'Empresa atualizada com sucesso'
      );

      return updatedCompany;

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
