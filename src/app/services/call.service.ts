import { inject, Injectable } from '@angular/core';
import { Observable, combineLatest, map, from, switchMap, catchError, of, forkJoin } from 'rxjs';
import { Call, Company, SimplifiedCall, User } from '../models/models';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, getDoc, getDocs, orderBy, query, Timestamp, updateDoc, where } from '@angular/fire/firestore';
import { SendNotificationService } from './send-notification.service';
import { SessionService } from './session.service';
import { AuthService } from './auth.service';
import { NotificationType } from '../enums/notificationType.enum';
import { formatDate } from '@angular/common';

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

  getCalls$(closed?: boolean, helpDeskCompanyId?: string): Observable<Call[]> {
    const constraints: any[] = [];

    // Se tiver helpDeskCompanyId, filtra
    if (helpDeskCompanyId) {
      constraints.push(where('helpDeskCompanyId', '==', helpDeskCompanyId));
    }

    // Se closed for true ou false, aplica filtro
    if (closed === true) {
      constraints.push(where('closed', '==', true));
    } else if (closed === false) {
      constraints.push(where('closed', '==', false));
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

  // No CallService
  getSimplifiedCalls(helpDeskCompanyId?: string): Observable<SimplifiedCall[]> {
    const constraints: any[] = [];

    if (helpDeskCompanyId) {
      constraints.push(where('helpDeskCompanyId', '==', helpDeskCompanyId));
    }

    const q = query(this._collectionCalls, ...constraints);

    return collectionData(q, { idField: 'id' }).pipe(
      switchMap((calls: any[]) => {
        // Processa cada chamado para obter o nome da empresa
        const processedCalls = calls.map(call => {
          const callDate = (call.created as any)?.toDate?.() || new Date();
          const formattedDate = formatDate(callDate, 'dd/MM/yyyy', 'en-US');

          // Se já tiver os dados da empresa incluídos
          if (call.company) {
            return of({
              id: call.id,
              data: formattedDate,
              companyId: call.companyId,
              companyName: call.company.name
            });
          }

          // Caso contrário, busca o nome da empresa
          const companyRef = doc(this._firestore, PATH_COMPANIES, call.companyId);
          return from(getDoc(companyRef)).pipe(
            map(companySnap => ({
              id: call.id,
              data: formattedDate,
              companyId: call.companyId,
              companyName: companySnap.exists() ? (companySnap.data() as Company).name : 'Empresa Desconhecida'
            }))
          );
        });

        // Combina todos os observables em um único array
        return forkJoin(processedCalls);
      }),
      catchError(error => {
        console.error('Erro ao buscar chamados simplificados:', error);
        this.messageService.customNotification(
          NotificationType.ERROR,
          'Erro ao buscar lista de chamados'
        );
        return of([]);
      })
    );
  }



}
