import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SendNotificationService } from './send-notification.service';
import { catchError, Observable, throwError } from 'rxjs';
import { IForm } from '../interface/dynamic-form.interface';
import { NotificationType } from '../enums/notificationType.enum';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private notificationService: SendNotificationService) {}

  // Método para buscar o formulário de uma entidade específica via HTTP GET
  getForm(entity: string): Observable<IForm> {
    return this.http.get<IForm>(`${this.apiUrl}/${entity}`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.notificationService.customNotification(NotificationType.ERROR, `Verifique a conexão com o servidor: ${error.message}`);
        return throwError(() => new Error('Falha ao carregar dados do formulário'));
      })
    );
  }

  // Método para buscar os dados de navegação lateral (sidebar) via HTTP GET
  getSideNavBar(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/navbarData`).pipe(
      catchError((error: HttpErrorResponse) => {
        this.notificationService.customNotification(NotificationType.ERROR, `Verifique a conexão com o servidor: ${error.message}`);
        return throwError(() => new Error('Falha ao carregar dados da barra lateral.'));
      })
    );
  }
}
