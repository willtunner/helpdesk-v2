import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationType } from '../enums/notificationType.enum';

@Injectable({
  providedIn: 'root'
})
export class SendNotificationService {

  constructor(private snackBar: MatSnackBar) {}

  // Função para exibir notificação com base no tipo e na mensagem personalizada
  customNotification(type: NotificationType, message: string, duration: number = 5000): void {
    let panelClass = '';
    switch (type) {
      case NotificationType.SUCCESS:
        panelClass = 'success-snackbar';
        break;
      case NotificationType.UPDATE:
        panelClass = 'info-snackbar';
        break;
      case NotificationType.ERROR:
        panelClass = 'error-snackbar';
        break;
      default:
        panelClass = 'default-snackbar';
        break;
    }

    // Exibe a notificação personalizada
    this.snackBar.open(message, 'Fechar', {
      duration,
      panelClass: ['custom-snackbar', panelClass],
    });
  }
}
