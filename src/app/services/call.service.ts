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
const PATH_HELPCOMPANIES = 'helpCompanies';

@Injectable({
  providedIn: 'root'
})
export class CallService {
  private _firestore = inject(Firestore);
  private _collectionCalls = collection(this._firestore, PATH_CALLS);
  private _collectionClients = collection(this._firestore, PATH_CLIENTS);
  private _collectionCompanies = collection(this._firestore, PATH_COMPANIES);
  private _collectionHelpCompanies = collection(this._firestore, PATH_HELPCOMPANIES);

  constructor(
    private messageService: SendNotificationService,
    private sessionService: SessionService,
    private authservice: AuthService
  ) { }

  // Retorna lista de chamados de uma helpCompany específica e operador opcional
  getCallsByHelpDeskCompany$(helpDeskCompanyId: string, operatorId?: string): Observable<Call[]> {
    const constraints = [
      where('helpDeskCompanyId', '==', helpDeskCompanyId)
    ];

    if (operatorId) {
      constraints.push(where('operatorId', '==', operatorId));
    }

    const q = query(this._collectionCalls, ...constraints);

    return collectionData(q, { idField: 'id' }).pipe(
      map((calls: any[]) => {
        return calls.map(call => ({
          ...call,
          created: (call.created as any)?.toDate?.() || new Date(),
          updated: (call.updated as any)?.toDate?.() || new Date(),
          finalized: (call.finalized as any)?.toDate?.() || null
        }));
      }),
      catchError(error => {
        console.error('Erro ao buscar chamadas:', error);
        this.messageService.customNotification(NotificationType.ERROR, 'Erro ao buscar chamadas');
        return of([]);
      })
    );
  }



}
