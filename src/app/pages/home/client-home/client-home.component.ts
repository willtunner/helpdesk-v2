import { Component, OnInit } from '@angular/core';
import { NotificationType } from '../../../enums/notificationType.enum';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SendNotificationService } from '../../../services/send-notification.service';
import { MatDialog } from '@angular/material/dialog';
import { Company, User } from '../../../models/models';
import { UserType } from '../../../enums/user-types.enum';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../../services/client.service';
import { MatIconModule } from '@angular/material/icon';
import { DynamicTableComponent } from '../../../shared/components/dynamic-table/dynamic-table.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog copy/confirmation-dialog.component';
import { CreateClienteModalComponent } from '../clients-modal/create-cliente-modal/create-cliente-modal.component';

@Component({
  selector: 'app-client-home',
  standalone: true,
  imports: [
    TranslateModule,
    CommonModule,
    MatIconModule,
    DynamicTableComponent,
    MatIconModule,
  ],
  templateUrl: './client-home.component.html',
  styleUrl: './client-home.component.scss'
})
export class ClientHomeComponent implements OnInit {
  user!: User;
  userRole: UserType | null = null;
  activeDropdown: number | null = null;
  companies: Company[] = [];

  headers = [
    { key: 'name', label: 'table.name' },
    { key: 'email', label: 'table.email' },
    { key: 'phone', label: 'table.phone' },
    { key: 'connection', label: 'table.connection' }
  ];

  constructor(
    private auth: AuthService,
    private userService: UserService,
    private clientService: ClientService,
    private dialog: MatDialog,
    private sendNotificationService: SendNotificationService,
    private translate: TranslateService
  ) {
    const session = this.auth.currentUser();

    if (session) {
      this.user = session;
      try {
        this.userRole = this.userService.getEffectiveUserRole(this.user);
      } catch (err) {
      }
    }
  }

  async ngOnInit(): Promise<void> {
    this.loadCompaniesWithClients();
  }

  // Método para carregar empresas com clientes
  private loadCompaniesWithClients(): void {
    this.clientService.getCompaniesWithClients(this.user.helpDeskCompanyId!)
      .then(companies => {
        console.log('Empresas com clientes:', companies);
        this.companies = companies;
      })
      .catch(error => {
        console.error('Erro:', error);
        this.sendNotificationService.customNotification(
          NotificationType.ERROR,
          this.translate.instant('client.notifications.error.loadingCompanies')
        );
      });
  }

  toggleDropdown(index: number): void {
    this.activeDropdown = this.activeDropdown === index ? null : index;
  }

  // Método para atualizar cliente
  async updateDocument(client: User): Promise<void> {
    try {
      console.log('Atualizando cliente:', client);
      
      // Extrai o ID e mantém apenas os dados atualizáveis
      const { id, ...clientData } = client;
      
      // Chama o serviço para atualizar o cliente
      const updatedClient = await this.clientService.updateClient(id, clientData);
      
      // Atualiza a lista local de clientes
      this.updateLocalClient(updatedClient);
      
      // Mostra notificação de sucesso
      this.sendNotificationService.customNotification(
        NotificationType.SUCCESS,
        this.translate.instant('client.notifications.success.clientUpdated', { name: updatedClient.name })
      );
      
      console.log('Cliente atualizado:', updatedClient);
      
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      
      // Mostra notificação de erro
      this.sendNotificationService.customNotification(
        NotificationType.ERROR,
        this.translate.instant('client.notifications.error.updatingClient')
      );
      
      // Relança o erro para que a tabela possa tratar o estado de erro
      throw error;
    }
  }

  // Método para atualizar o cliente na lista local
  private updateLocalClient(updatedClient: User): void {
    this.companies = this.companies.map(company => {
      // Verifica se a empresa tem o cliente que foi atualizado
      const clientIndex = company.clients.findIndex(c => c.id === updatedClient.id);
      
      if (clientIndex !== -1) {
        // Atualiza o cliente na empresa
        const updatedClients = [...company.clients];
        updatedClients[clientIndex] = updatedClient;
        
        return {
          ...company,
          clients: updatedClients
        };
      }
      
      return company;
    });
  }

  deleteDocument(client: User, company: Company): void {
    console.log('Deletar documento:', client);
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: this.translate.instant('client.confirmation.deleteTitle'),
        message: this.translate.instant('client.confirmation.deleteClientMessage', { 
          clientName: client.name, 
          companyName: company.name 
        })
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clientService.deleteClient(client.id).then(() => {
          // Atualiza a lista local removendo o cliente
          this.companies = this.companies.map(c => {
            if (c.id === company.id) {
              return {
                ...c,
                clients: c.clients.filter(c => c.id !== client.id)
              };
            }
            return c;
          });
          
          // Notificação de sucesso
          this.sendNotificationService.customNotification(
            NotificationType.ERROR,
            this.translate.instant('client.notifications.success.clientDeleted', { name: client.name })
          );
          
        }).catch(err => {
          console.error('Erro ao deletar cliente:', err);
          this.sendNotificationService.customNotification(
            NotificationType.ERROR,
            this.translate.instant('client.notifications.error.deletingClient')
          );
        });
      }
    });
  }

  openCreateClientModal(company: Company): void {
    const dialogRef = this.dialog.open(CreateClienteModalComponent, {
      width: '600px',
      data: {
        companyId: company.id,
        companyName: company.name
      }
    });
  
    dialogRef.afterClosed().subscribe((newClient) => {
      if (newClient) {
        // Atualiza a lista de clientes daquela empresa
        this.companies = this.companies.map(c => {
          if (c.id === company.id) {
            return {
              ...c,
              clients: [...c.clients, newClient]
            };
          }
          return c;
        });
        
        // Notificação de sucesso
        this.sendNotificationService.customNotification(
          NotificationType.SUCCESS,
          this.translate.instant('client.notifications.success.clientCreated', { name: newClient.name })
        );
      }
    });
  }
}