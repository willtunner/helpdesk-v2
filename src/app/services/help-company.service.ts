import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  updateDoc,
  doc
} from '@angular/fire/firestore';
import { HelpDeskCompany } from '../models/models';
import { SendNotificationService } from './send-notification.service';
import { NotificationType } from '../enums/notificationType.enum';

@Injectable({
  providedIn: 'root'
})
export class HelpCompanyService {
  private _firestore = inject(Firestore);
  private _collection = collection(this._firestore, 'helpCompanies');

  constructor(private messageService: SendNotificationService) {}

  async createAccountHelpCompany(data: Partial<HelpDeskCompany>): Promise<HelpDeskCompany> {
    const now = new Date();

    const helpCompany: Omit<HelpDeskCompany, 'id'> = {
      ...data,
      keywords: [data.name?.toLowerCase() || ''],
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
}
