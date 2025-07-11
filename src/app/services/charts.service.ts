import { inject, Injectable } from '@angular/core';
import { Observable, combineLatest, map, from, switchMap, catchError, of } from 'rxjs';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, getDoc, getDocs, orderBy, query, Timestamp, updateDoc, where } from '@angular/fire/firestore';
import { Call, Company, User } from '../models/models';
import { AuthService } from './auth.service';

const PATH_CALLS = 'calls';
const PATH_COMPANIES = 'company';
const PATH_CLIENTS = 'users';

@Injectable({
  providedIn: 'root'
})

export class ChartsService {
  private _firestore = inject(Firestore);
  private _collection = collection(this._firestore, PATH_CALLS);

  constructor(private authservice: AuthService) { }

  // getCallsByCompany(): Observable<Highcharts.Options> {
  //   const currentYear = new Date().getFullYear();
  //   const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  //   const currentUser = this.authservice.currentUser();
  
  //   if (!currentUser) {
  //     throw new Error('Usuário não autenticado!');
  //   }
  
  //   const userId = currentUser.id;
  //   const role = currentUser.roles;
  
  //   let filters = [];
  //   if (role.includes("OPERATOR")) {
  //     filters.push(where('operatorId', '==', userId));
  //   } else if (role.includes("CLIENT")) {
  //     filters.push(where('clientId', '==', userId));
  //   }
  
  //   return collectionData(query(this._collection, ...filters), { idField: 'id' }).pipe(
  //     map((calls: Call[]) =>
  //       calls.filter((call) => {
  //         let createdDate: Date | null = null;
  
  //         if (call.created instanceof Date) {
  //           createdDate = call.created;
  //         } else if ((call.created as any)?.toDate) {
  //           createdDate = (call.created as any).toDate();
  //         }
  
  //         return createdDate && createdDate.getFullYear() === currentYear;
  //       })
  //     ),
  //     switchMap((filteredCalls: Call[]) => {
  //       const uniqueCompanyIds = Array.from(new Set(filteredCalls.map((call) => call.companyId)));
  //       const uniqueOperatorIds = [...new Set(filteredCalls.map(call => call.operatorId).filter(id => id))];
  //       const uniqueClientIds = [...new Set(filteredCalls.map(call => call.clientId).filter(id => id))];
  
  //       // Buscar empresas, operadores e clientes
  //       const companies$ = combineLatest(
  //         uniqueCompanyIds.map((id) =>
  //           this.getCompanyById(id).pipe(catchError(() => of(null)))
  //         )
  //       );
  //       const operators$ = combineLatest(
  //         uniqueOperatorIds.map((id) =>
  //           this.getUserById(id).pipe(catchError(() => of(null)))
  //         )
  //       );
  //       const clients$ = combineLatest(
  //         uniqueClientIds.map((id) =>
  //           this.getClientById(id).pipe(catchError(() => of(null)))
  //         )
  //       );
  
  //       return combineLatest([companies$, operators$, clients$]).pipe(
  //         map(([companies, operators, clients]: [(Company | null)[], (User | null)[], (Client | null)[]]) => {
  //           // Mapear empresas, operadores e clientes
  //           const companyMap: Record<string, Company> = {};
  //           uniqueCompanyIds.forEach((id, index) => {
  //             if (companies[index]) companyMap[id] = companies[index]!;
  //           });
  
  //           const operatorMap: Record<string, User> = {};
  //           uniqueOperatorIds.forEach((id, index) => {
  //             if (operators[index]) operatorMap[id] = operators[index]!;
  //           });
  
  //           const clientMap: Record<string, Client> = {};
  //           uniqueClientIds.forEach((id, index) => {
  //             if (clients[index]) clientMap[id] = clients[index]!;
  //           });
  
  //           // Enriquecer os chamados com company, operator e client
  //           const enrichedCalls: Call[] = filteredCalls.map(call => ({
  //             ...call,
  //             company: companyMap[call.companyId] || { id: call.companyId, name: 'Desconhecida' } as Company,
  //             operator: operatorMap[call.operatorId] || { id: call.operatorId, username: 'Desconhecido' } as User,
  //             client: clientMap[call.clientId] || null
  //           }));
  
  //           // Gerar os dados do gráfico
  //           const series = companies
  //             .filter((company): company is Company => !!company)
  //             .map((company) => {
  //               const data = Array(12).fill(0);
  
  //               enrichedCalls
  //                 .filter((call) => call.companyId === company.id)
  //                 .forEach((call) => {
  //                   let createdDate: Date | null = null;
  
  //                   if (call.created instanceof Date) {
  //                     createdDate = call.created;
  //                   } else if ((call.created as any)?.toDate) {
  //                     createdDate = (call.created as any).toDate();
  //                   }
  
  //                   if (createdDate) {
  //                     const monthIndex = createdDate.getMonth();
  //                     data[monthIndex]++;
  //                   }
  //                 });
  
  //               return {
  //                 type: 'line',
  //                 name: company.name,
  //                 data,
  //               };
  //             });
  
  //           return {
  //             title: { text: 'Chamados por mês!' },
  //             xAxis: { categories: months },
  //             series,
  //           };
  //         })
  //       );
  //     }),
  //     catchError((err) => {
  //       console.error('Erro ao gerar gráfico de linhas:', err);
  //       return of({
  //         title: { text: 'Erro ao carregar dados' },
  //         xAxis: { categories: months },
  //         series: []
  //       });
  //     })
  //   );
  // }

  //! Mudar para serviço de empresas
  getCompanyById(companyId: string): Observable<Company | null> {
    return this.getDocumentById<Company>(PATH_COMPANIES, companyId);
  }

  // Novo método para buscar usuário por ID
  getUserById(userId: string): Observable<User | null> {
    return this.getDocumentById<User>('users', userId);
  }

  private getDocumentById<T>(path: string, id: string): Observable<T | null> {
    const docRef = doc(this._firestore, `${path}/${id}`);
    return from(getDoc(docRef)).pipe(
      map((docSnap) => (docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null))
    );
  }

  // Obter cliente pelo ID
  getClientById(clientId: string): Observable<User | null> {
    return this.getDocumentById<User>(PATH_CLIENTS, clientId);
  }


}


