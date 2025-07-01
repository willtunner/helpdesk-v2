import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company, User } from '../models/models';
import { environment } from '../environments/environment';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, updateDoc, query, where, getDocs, orderBy } from '@angular/fire/firestore';
import { SendNotificationService } from './send-notification.service';
import { NotificationType } from '../enums/notificationType.enum';

const PATH = 'company';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private _firestore = inject(Firestore);
  private _collection = collection(this._firestore, PATH);

  private apiUrl = `${environment.apiUrl}/company`; // URL base da API

  constructor(private http: HttpClient, private messageService: SendNotificationService) { }

  

  // FIREBASE
  getCompanyByFirebase(): Observable<Company[]> {
    // Adiciona orderBy para ordenar por 'name' em ordem alfabética
    const orderedQuery = query(this._collection, orderBy('name', 'asc'));
    return collectionData(orderedQuery, { idField: 'id' }) as Observable<Company[]>;
  }


  async saveCallWithGeneratedId(call: Omit<Company, 'id'>): Promise<void> {
    console.log('call gravada', call);
    try {
      // Adiciona o documento e obtém a referência
      const docRef = await addDoc(this._collection, call);

      // 
      this.messageService.customNotification(NotificationType.SUCCESS,`Empresa "${call.name}" Criada com Sucesso!`);

      // Atualiza o documento com o ID gerado
      await updateDoc(docRef, { id: docRef.id });
    } catch (error) {
      console.error('Erro ao salvar a Call no Firebase:', error);
      this.messageService.customNotification(NotificationType.ERROR,`Empresa "${call.name}" não foi Criada!`);
      throw error;
    }
  }

  async deleteCallById(companyId: string): Promise<void> {
    try {
      // Certifique-se de que o caminho do documento está correto
      const callDocRef = doc(this._firestore, `calls/${companyId}`);
      await deleteDoc(callDocRef);
    } catch (error) {
      console.error('Erro ao excluir a Call:', error);
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
      this.messageService.customNotification(NotificationType.ERROR,'Erro ao buscar clientes pelo companyId');
      throw error;
    }
  }

  async getCompanyById(companyId: string): Promise<Company | null> {
    try {
      // Referência ao documento da empresa pelo ID
      const companyDocRef = doc(this._firestore, `${PATH}/${companyId}`);
  
      // Busca o documento no Firestore
      const docSnapshot = await getDocs(query(collection(this._firestore, PATH), where('id', '==', companyId)));
  
      // Verifica se o documento existe
      if (!docSnapshot.empty) {
        const companyData = docSnapshot.docs[0].data();
        return { id: companyId, ...companyData } as Company;
      } else {
        console.warn(`Empresa com ID ${companyId} não encontrada.`);
        return null; // Agora o TypeScript aceita
      }
    } catch (error) {
      console.error('Erro ao buscar empresa pelo ID:', error);
      this.messageService.customNotification(
        NotificationType.ERROR,
        'Erro ao buscar empresa pelo ID'
      );
      throw error; // Relança o erro para tratamento externo
    }
  }

  getCompaniesWithFilters(filters: any): Observable<Company[]> {
    let q = query(this._collection, orderBy('name', 'asc'));
  
    // Adiciona filtros dinamicamente
    if (filters.name) {
      q = query(q, where('keywords', 'array-contains', filters.name.toLowerCase()));
    }
    if (filters.cnpj) {
      q = query(q, where('cnpj', '==', filters.cnpj.replace(/\D/g, '')));
    }
    if (filters.email) {
      q = query(q, where('email', '==', filters.email.toLowerCase()));
    }
    if (filters.state) {
      q = query(q, where('state', '==', filters.state));
    }
    if (filters.version_serv) {
      q = query(q, where('versionServ', '==', filters.version_serv));
    }
  
    return collectionData(q, { idField: 'id' }) as Observable<Company[]>;
  }
  


}
