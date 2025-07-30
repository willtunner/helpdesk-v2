// call.service.ts
import { inject, Injectable } from '@angular/core';
import { Observable, combineLatest, map, from, switchMap, catchError, of, forkJoin, throwError } from 'rxjs';
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
const PATH_OPERATOR = 'users';

@Injectable({
  providedIn: 'root'
})
export class CallService {
  private _firestore = inject(Firestore);
  private _collectionCalls = collection(this._firestore, PATH_CALLS);
  private _collectionClients = collection(this._firestore, PATH_CLIENTS);
  private _collectionCompanies = collection(this._firestore, PATH_COMPANIES);
  private _collectionHelpCompanies = collection(this._firestore, PATH_HELPCOMPANIES);
  private _collectionOperator = collection(this._firestore, PATH_OPERATOR);

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

  getSimplifiedCallsFiltered(
    helpDeskCompanyId?: string | null,
    companyId?: string | null
  ): Observable<SimplifiedCall[]> {
    const constraints: any[] = [];

    if (helpDeskCompanyId != null) {
      constraints.push(where('helpDeskCompanyId', '==', helpDeskCompanyId));
    }

    if (companyId != null) {
      constraints.push(where('companyId', '==', companyId));
    }

    const q = query(this._collectionCalls, ...constraints);

    return collectionData(q, { idField: 'id' }).pipe(
      switchMap((calls: any[]) => {
        const processedCalls = calls.map(call => {
          const callDate = (call.created as any)?.toDate?.() || new Date();
          const formattedDate = formatDate(callDate, 'dd/MM/yyyy', 'en-US');

          if (call.company) {
            return of({
              callId: call.id,
              date: formattedDate,
              companyId: call.companyId,
              companyName: call.company.name
            });
          }

          const companyRef = doc(this._firestore, PATH_COMPANIES, call.companyId);
          return from(getDoc(companyRef)).pipe(
            map(companySnap => ({
              callId: call.id,
              date: formattedDate,
              companyId: call.companyId,
              companyName: companySnap.exists()
                ? (companySnap.data() as Company).name
                : 'Empresa Desconhecida'
            }))
          );
        });

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

  getCallsByIds(ids: string[]): Observable<Call[]> {
    if (!Array.isArray(ids) || ids.length === 0) {
      return of([]);
    }
  
    const uniqueIds = [...new Set(ids)];
  
    const callRequests$ = uniqueIds.map(id => {
      const callRef = doc(this._firestore, PATH_CALLS, id);
  
      return from(getDoc(callRef)).pipe(
        switchMap(callSnap => {
          if (!callSnap.exists()) {
            console.warn(`Chamado com ID ${id} não encontrado`);
            return of(null);
          }
  
          const callData = callSnap.data() as any;
  
          const callBase: Call = {
            id: callSnap.id,
            ...callData,
            created: callData.created?.toDate?.() || new Date(),
            updated: callData.updated?.toDate?.() || new Date(),
            finalized: callData.finalized?.toDate?.() || null,
            client: {} as User,
            operator: {} as User,
            company: {} as Company
          };
  
          // Referências relacionadas
          const companyRef = doc(this._firestore, PATH_COMPANIES, callData.companyId);
          const clientRef = doc(this._firestore, PATH_CLIENTS, callData.clientId);
          const operatorRef = doc(this._firestore, PATH_OPERATOR, callData.operatorId);
  
          return forkJoin([
            from(getDoc(clientRef)),
            from(getDoc(companyRef)),
            from(getDoc(operatorRef))
          ]).pipe(
            map(([clientSnap, companySnap, operatorSnap]) => {
              const client = clientSnap.exists() ? { id: clientSnap.id, ...clientSnap.data() } as User : null;
              const company = companySnap.exists() ? { id: companySnap.id, ...companySnap.data() } as Company : null;
              const operator = operatorSnap.exists() ? { id: operatorSnap.id, ...operatorSnap.data() } as User : null;
  
              // Logs conforme solicitado
              // console.log(`Cliente (${callBase.id}):`, client);
              // console.log(`Empresa (${callBase.id}):`, company);
              // console.log(`Operador (${callBase.id}):`, operator);
  
              return {
                ...callBase,
                client: client ?? null,
                company: company ?? null,
                operator: operator ?? null
              };
            })
          );
        }),
        catchError(error => {
          console.error(`Erro ao buscar chamado ${id}:`, error);
          return of(null);
        })
      );
    });
  
    return forkJoin(callRequests$).pipe(
      map(calls => calls.filter((call): call is Call => call !== null) as Call[]),
      catchError(error => {
        console.error('Erro ao buscar chamados por IDs:', error);
        this.messageService.customNotification(
          NotificationType.ERROR,
          'Erro ao buscar lista de chamados'
        );
        return of([]);
      })
    );
  }
  
  
  
  async saveCallWithGeneratedId(call: Omit<Call, 'id'>): Promise<void> {
    console.log('Salvando chamada:', call);
    try {
      // Define os timestamps antes de salvar
      call.created = new Date();
      call.updated = new Date();

      const docRef = await addDoc(this._collectionCalls, call); // Salva o documento sem ID
      await updateDoc(docRef, { id: docRef.id }); // Atualiza o campo ID com o gerado pelo Firestore

      this.messageService.customNotification(
        NotificationType.SUCCESS,
        `Call salva com ID: ${docRef}`,
        5000
      );
    } catch (error) {
      console.error('Erro ao salvar a chamada:', error);
      throw error;
    }
  }
  



}
