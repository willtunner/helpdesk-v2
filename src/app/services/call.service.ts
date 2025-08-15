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
import { OperatorsService } from './operators.service';
import { CompanyService } from './company.service';
import { ClientService } from './client.service';

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
    private authservice: AuthService,
    private operatorsService: OperatorsService,
    private companyService: CompanyService,
    private clientService: ClientService
  ) { }

  // Retorna lista de chamados de uma helpCompany específica e operador opcional
  getCallsByHelpDeskCompany$(helpDeskCompanyId: string, operatorId?: string): Observable<Call[]> {
    const constraints = [
      where('helpDeskCompanyId', '==', helpDeskCompanyId),
      orderBy('created', 'desc')
    ];

    if (operatorId) {
      constraints.push(where('operatorId', '==', operatorId));
    }

    const q = query(this._collectionCalls, ...constraints);

    return collectionData(q, { idField: 'id' }).pipe(
      switchMap((calls: any[]) => {
        if (calls.length === 0) return of([]);

        // Para cada call, criamos um observable que busca os dados completos
        const callsWithDetails$ = calls.map(call => {
          // Converte as datas
          const created = (call.created as any)?.toDate?.() || new Date();
          const updated = (call.updated as any)?.toDate?.() || new Date();
          const finalized = call.finalized ? (call.finalized as any)?.toDate?.() || null : null;

          // Cria observables para cada entidade relacionada
          const company$ = call.companyId
            ? from(this.companyService.getCompanyById(call.companyId))
            : of(null);

          const operator$ = call.operatorId
            ? from(this.operatorsService.getUserById(call.operatorId))
            : of(null);

          const client$ = call.clientId
            ? from(this.clientService.getClientById(call.clientId))
            : of(null);

          // Combina todos os observables
          return forkJoin([company$, operator$, client$]).pipe(
            map(([company, operator, client]) => ({
              ...call,
              created,
              updated,
              finalized,
              company,
              operator,
              client
            } as Call))
          );
        });

        // Combina todos os observables de calls
        return forkJoin(callsWithDetails$);
      }),
      catchError(error => {
        console.error('Erro ao buscar chamadas:', error);
        this.messageService.customNotification(
          NotificationType.ERROR,
          'Erro ao buscar chamadas'
        );
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

  async saveCallWithGeneratedId(call: Omit<Call, 'id'>): Promise<Call> {
    try {
      // Define os timestamps antes de salvar
      call.created = new Date();
      call.updated = new Date();

      const docRef = await addDoc(this._collectionCalls, call);
      console.log('Call salva com ID:', docRef.id);
      
      // Atualiza o documento com o ID
      await updateDoc(docRef, { id: docRef.id });
      
      // Cria o objeto Call completo para retornar
      const savedCall: Call = {
        id: docRef.id,
        ...call,
        company: null,
        client: null,
        operator: null
      };

      this.messageService.customNotification(
        NotificationType.SUCCESS,
        `Chamado salvo com ID: ${docRef.id}`,
        5000
      );

      return savedCall;
    } catch (error) {
      console.error('Erro ao salvar a chamada:', error);
      this.messageService.customNotification(
        NotificationType.ERROR,
        'Erro ao salvar chamado'
      );
      throw error;
    }
  }

  getCallById(id: string): Observable<Call> {
    console.log('Buscando chamado com ID:', id);
    const callRef = doc(this._firestore, PATH_CALLS, id);

    return from(getDoc(callRef)).pipe(
      switchMap(callSnap => {
        if (!callSnap.exists()) {
          console.log('Chamado não encontrado');
          return throwError(() => new Error(`Chamado com ID ${id} não encontrado`));
        }

        const callData = callSnap.data() as any;
        console.log('Dados brutos do chamado:', callData);

        const callBase: Partial<Call> = {
          id: callSnap.id,
          ...callData,
          created: callData.created?.toDate?.() || new Date(),
          updated: callData.updated?.toDate?.() || new Date(),
          finalized: callData.finalized?.toDate?.() || null
        };

        // Referências relacionadas
        const company$ = callData.companyId 
          ? from(this.companyService.getCompanyById(callData.companyId))
          : of(null);
        
        const client$ = callData.clientId
          ? from(this.clientService.getClientById(callData.clientId))
          : of(null);
        
        const operator$ = callData.operatorId
          ? from(this.operatorsService.getUserById(callData.operatorId))
          : of(null);

        return forkJoin([company$, client$, operator$]).pipe(
          map(([company, client, operator]) => {
            console.log('Dados completos do chamado:', { ...callBase, company, client, operator });
            return {
              ...callBase,
              company,
              client,
              operator
            } as Call;
          })
        );
      }),
      catchError(error => {
        console.error(`Erro ao buscar chamado ${id}:`, error);
        this.messageService.customNotification(
          NotificationType.ERROR,
          'Erro ao buscar detalhes do chamado'
        );
        return throwError(() => error);
      })
    );
  }

  



}
