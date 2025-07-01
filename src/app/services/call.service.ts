import { inject, Injectable } from '@angular/core';
import { Observable, combineLatest, map, from, switchMap, catchError, of } from 'rxjs';
import { Call, Company, User } from '../models/models';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, getDoc, getDocs, orderBy, query, Timestamp, updateDoc, where } from '@angular/fire/firestore';
import { SendNotificationService } from './send-notification.service';
import { SessionService } from './session.service';
import { AuthService } from './auth.service';
import { NotificationType } from '../enums/notificationType.enum';

const PATH_CALLS = 'calls';
const PATH_COMPANIES = 'company';
const PATH_CLIENTS = 'clients';

@Injectable({
  providedIn: 'root'
})
export class CallService {
  private _firestore = inject(Firestore);
  private _collection = collection(this._firestore, PATH_CALLS);
  private _collectionCompany = collection(this._firestore, PATH_COMPANIES);

  constructor(
    private messageService: SendNotificationService,
    private sessionService: SessionService,
    private authservice: AuthService
  ) { }

  // Pegar chamados de uma empresa
  getCallsByCompanyId(companyId: string): Observable<Call[]> {
    const q = query(this._collection, where('companyId', '==', companyId));
    return collectionData(q, { idField: 'id' }).pipe(
      map((calls: any[]) => calls as Call[])
    );
  }

  // Pegar chamados de um cliente
  getCallsByClientId(clientId: string): Observable<Call[]> {
    const q = query(this._collection, where('clientId', '==', clientId));
    return collectionData(q, { idField: 'id' }).pipe(
      map((calls: any[]) => calls as Call[])
    );
  }

  // Pegar chamados de um operador
  getCallsByOperatorId(operatorId: string): Observable<Call[]> {
    const q = query(this._collection, where('operatorId', '==', operatorId));
    return collectionData(q, { idField: 'id' }).pipe(
      map((calls: any[]) => calls as Call[])
    );
  }

  // Pegar chamados de um usuário (por ID do usuário relacionado)
  getCallsByUserId(userId: string): Observable<Call[]> {
    const q = query(this._collection, where('user.id', '==', userId));
    return collectionData(q, { idField: 'id' }).pipe(
      map((calls: any[]) => calls as Call[])
    );
  }

  // Pegar chamado por ID
  getCallById(callId: string): Observable<Call | null> {
    const ref = doc(this._collection, callId);
    return from(getDoc(ref)).pipe(
      map(snapshot => {
        const data = snapshot.data();
        return data ? { id: snapshot.id, ...data } as Call : null;
      }),
      catchError(err => {
        console.error('Erro ao buscar chamado por ID:', err);
        return of(null);
      })
    );
  }

  // Pegar todos os chamados entre datas
  getCallsBetweenDates(startDate: Date, endDate: Date): Observable<Call[]> {
    const q = query(
      this._collection,
      where('created', '>=', Timestamp.fromDate(startDate)),
      where('created', '<=', Timestamp.fromDate(endDate)),
      orderBy('created', 'asc')
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map((calls: any[]) => calls as Call[]),
      catchError(err => {
        console.error('Erro ao buscar chamados entre datas:', err);
        return of([]);
      })
    );
  }

  // Excluir chamado por ID
  deleteCallById(callId: string): Observable<boolean> {
    const ref = doc(this._collection, callId);
    return from(deleteDoc(ref)).pipe(
      map(() => true),
      catchError(err => {
        console.error('Erro ao excluir chamado:', err);
        return of(false);
      })
    );
  }

  // Atualizar um chamado
  updateCall(callId: string, updateData: Partial<Call>): Observable<boolean> {
    const ref = doc(this._collection, callId);
    return from(updateDoc(ref, {
      ...updateData,
      updated: new Date()
    })).pipe(
      map(() => true),
      catchError(err => {
        console.error('Erro ao atualizar chamado:', err);
        return of(false);
      })
    );
  }

}
