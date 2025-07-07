import { inject, Injectable } from '@angular/core';
import { Observable, combineLatest, map, from, switchMap, catchError, of } from 'rxjs';
import { Call, Client, Company, User } from '../models/models';
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
      map((calls) => calls.map(call => call as Call))
    );
  }

  // Pegar chamados de um cliente
  getCallsByClientId(clientId: string): Observable<Call[]> {
    const q = query(this._collection, where('clientId', '==', clientId));
    return collectionData(q, { idField: 'id' }).pipe(
      map((calls) => calls.map(call => call as Call))
    );
  }

  // Pegar chamados de um operador
  getCallsByOperatorId(operatorId: string): Observable<Call[]> {
    const q = query(this._collection, where('operatorId', '==', operatorId));
    return collectionData(q, { idField: 'id' }).pipe(
      map((calls) => calls.map(call => call as Call))
    );
  }

  // Pegar chamados de um usuário (por ID do usuário relacionado)
  getCallsByUserId(userId: string): Observable<Call[]> {
    const q = query(this._collection, where('user.id', '==', userId));
    return collectionData(q, { idField: 'id' }).pipe(
      map((calls) => calls.map(call => call as Call))
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
      map((calls) => calls.map(call => call as Call)),
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

  getCallsByCompany(): Observable<Highcharts.Options> {
    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentUser = this.authservice.currentUser();

    if (!currentUser) {
      throw new Error('Usuário não autenticado!');
    }

    const userId = currentUser.id;
    const role = currentUser.roles;

    let filters = [];
    if (role.includes("OPERATOR")) {
      filters.push(where('operatorId', '==', userId));
    } else if (role.includes("CLIENT")) {
      filters.push(where('clientId', '==', userId));
    }

    return collectionData(query(this._collection, ...filters), { idField: 'id' }).pipe(
      map((calls: any[]) => {
        return (calls as Call[]).filter((call) => {
          let createdDate: Date | null = null;

          if (call['created'] instanceof Date) {
            createdDate = call['created'];
          } else if ((call['created'] as any)?.toDate) {
            createdDate = (call['created'] as any).toDate();
          }

          return createdDate && createdDate.getFullYear() === currentYear;
        });
      }),
      switchMap((filteredCalls: Call[]) => {
        const uniqueCompanyIds = Array.from(new Set(filteredCalls.map((call) => call.companyId)));
        const uniqueOperatorIds = [...new Set(filteredCalls.map(call => call.operatorId).filter(id => id))];
        const uniqueClientIds = [...new Set(filteredCalls.map(call => call.clientId).filter(id => id))];

        // Buscar empresas, operadores e clientes
        const companies$ = combineLatest(
          uniqueCompanyIds.map((id) =>
            this.getCompanyById(id).pipe(catchError(() => of(null)))
          )
        );
        const operators$ = combineLatest(
          uniqueOperatorIds.map((id) =>
            this.getUserById(id).pipe(catchError(() => of(null)))
          )
        );
        const clients$ = combineLatest(
          uniqueClientIds.map((id) =>
            this.getClientById(id).pipe(catchError(() => of(null)))
          )
        );

        return combineLatest([companies$, operators$, clients$]).pipe(
          map(([companies, operators, clients]: [(Company | null)[], (User | null)[], (Client | null)[]]) => {
            // Mapear empresas, operadores e clientes
            const companyMap: Record<string, Company> = {};
            uniqueCompanyIds.forEach((id, index) => {
              if (companies[index]) companyMap[id] = companies[index]!;
            });

            const operatorMap: Record<string, User> = {};
            uniqueOperatorIds.forEach((id, index) => {
              if (operators[index]) operatorMap[id] = operators[index]!;
            });

            const clientMap: Record<string, Client> = {};
            uniqueClientIds.forEach((id, index) => {
              if (clients[index]) clientMap[id] = clients[index]!;
            });

            // Enriquecer os chamados com company, operator e client
            const enrichedCalls: Call[] = filteredCalls.map(call => ({
              ...call,
              company: companyMap[call.companyId] || { id: call.companyId, name: 'Desconhecida' } as Company,
              operator: operatorMap[call.operatorId] || { id: call.operatorId, username: 'Desconhecido' } as User,
              client: clientMap[call.clientId] || null
            }));

            // Gerar os dados do gráfico
            const series = companies
              .filter((company): company is Company => !!company)
              .map((company) => {
                const data = Array(12).fill(0);

                enrichedCalls
                  .filter((call) => call.companyId === company.id)
                  .forEach((call) => {
                    let createdDate: Date | null = null;

                    if (call.created instanceof Date) {
                      createdDate = call.created;
                    } else if ((call.created as any)?.toDate) {
                      createdDate = (call.created as any).toDate();
                    }

                    if (createdDate) {
                      const monthIndex = createdDate.getMonth();
                      data[monthIndex]++;
                    }
                  });

                return {
                  type: 'line' as const,
                  name: company.name,
                  data,
                };
              });

            return {
              title: { text: 'Chamados por mês!' },
              xAxis: { categories: months },
              series,
            };
          })
        );
      }),
      catchError((err) => {
        console.error('Erro ao gerar gráfico de linhas:', err);
        return of({
          title: { text: 'Erro ao carregar dados' },
          xAxis: { categories: months },
          series: []
        });
      })
    );
  }

  // Obter cliente pelo ID
  getClientById(clientId: string): Observable<Client | null> {
    return this.getDocumentById<Client>(PATH_CLIENTS, clientId);
  }

  // Método genérico para obter documentos por ID
  private getDocumentById<T>(path: string, id: string): Observable<T | null> {
    const docRef = doc(this._firestore, `${path}/${id}`);
    return from(getDoc(docRef)).pipe(
      map((docSnap) => (docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null))
    );
  }

  // Obter empresa pelo ID
  getCompanyById(companyId: string): Observable<Company | null> {
    return this.getDocumentById<Company>(PATH_COMPANIES, companyId);
  }

  // Novo método para buscar usuário por ID
  getUserById(userId: string): Observable<User | null> {
    return this.getDocumentById<User>('users', userId);
  }


  getCallsForCompanyAndMonth(companyName: string, monthIndex: number): Observable<Call[]> {
    const currentYear = new Date().getFullYear();
    const currentUser = this.authservice.currentUser();
  
    if (!currentUser) {
      throw new Error('Usuário não autenticado!');
    }
  
    const userId = currentUser.id;
    const role = currentUser.roles;
  
    let filters = [];
    if (role.includes("OPERATOR")) {
      filters.push(where('operatorId', '==', userId));
    } else if (role.includes("CLIENT")) {
      filters.push(where('clientId', '==', userId));
    }
  
    return (collectionData(query(this._collection, ...filters), { idField: 'id' }) as Observable<Call[]>).pipe(
      switchMap((calls: Call[]) => {
        return this.getCompanyByName(companyName).pipe(
          switchMap((company) => {
            if (!company) return of([]);
  
            const filteredCalls = calls.filter((call) => {
              let createdDate: Date | null = null;
              if (call.created instanceof Date) {
                createdDate = call.created;
              } else if ((call.created as any)?.toDate) {
                createdDate = (call.created as any).toDate();
              }
  
              return createdDate &&
                     call.companyId === company.id &&
                     createdDate.getFullYear() === currentYear &&
                     createdDate.getMonth() === monthIndex;
            });
  
            const uniqueOperatorIds = [...new Set(filteredCalls.map(call => call.operatorId).filter(id => id))];
            const uniqueClientIds = [...new Set(filteredCalls.map(call => call.clientId).filter(id => id))];
  
            const operators$ = combineLatest(
              uniqueOperatorIds.map((id) =>
                this.getUserById(id).pipe(catchError(() => of(null)))
              )
            );
            const clients$ = combineLatest(
              uniqueClientIds.map((id) =>
                this.getClientById(id).pipe(catchError(() => of(null)))
              )
            );
  
            return combineLatest([operators$, clients$]).pipe(
              map(([operators, clients]: [(User | null)[], (Client | null)[]]) => {
                const operatorMap: Record<string, User> = {};
                uniqueOperatorIds.forEach((id, index) => {
                  if (operators[index]) operatorMap[id] = operators[index]!;
                });
  
                const clientMap: Record<string, Client> = {};
                uniqueClientIds.forEach((id, index) => {
                  if (clients[index]) clientMap[id] = clients[index]!;
                });
  
                return filteredCalls.map(call => ({
                  ...call,
                  company: company, // Já temos a empresa do filtro por nome
                  operator: operatorMap[call.operatorId] || { id: call.operatorId, username: 'Desconhecido' } as User,
                  client: clientMap[call.clientId] || null
                }));
              })
            );
          })
        );
      }),
      catchError((err) => {
        console.error('Erro ao buscar chamados por empresa e mês:', err);
        return of([]);
      })
    );
  }

  private getCompanyByName(name: string): Observable<Company | null> {
    return (collectionData(query(this._collectionCompany, where('name', '==', name)), { idField: 'id' }) as Observable<Company[]>).pipe(
      map((companies) => companies[0] || null),
      catchError(() => of(null))
    );
  }
}
