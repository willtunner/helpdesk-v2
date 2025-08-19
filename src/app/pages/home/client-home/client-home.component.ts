//cliente-home.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DashboardCardComponent } from '../../../shared/components/dashboard-card/dashboard-card.component';
import { ClientsModalComponent } from '../clients-modal/clients-modal.component';
import { NotificationType } from '../../../enums/notificationType.enum';
import { CallModalComponent } from '../call-modal/call-modal.component';
import { AuthService } from '../../../services/auth.service';
import { HelpCompanyService } from '../../../services/help-company.service';
import { CallService } from '../../../services/call.service';
import { UserService } from '../../../services/user.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyService } from '../../../services/company.service';
import { SendNotificationService } from '../../../services/send-notification.service';
import { MatDialog } from '@angular/material/dialog';
import { Call, Company, SimplifiedCall, User } from '../../../models/models';
import { UserType } from '../../../enums/user-types.enum';
import { catchError, forkJoin, of, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ChartComponent } from '../../../shared/components/line-chart/line-chart.component';
import { ChartType } from '../../../enums/chart-types.enum';
import { ClientService } from '../../../services/client.service';
import { MatIconModule } from '@angular/material/icon';
import { DynamicTableComponent } from '../../../shared/components/dynamic-table/dynamic-table.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog copy/confirmation-dialog.component';
import { CreateClienteModalComponent } from '../clients-modal/create-cliente-modal/create-cliente-modal.component';

@Component({
  selector: 'app-client-home',
  standalone: true,
  imports: [
    DashboardCardComponent,
    TranslateModule,
    CommonModule,
    ChartComponent,
    MatIconModule,
    DynamicTableComponent,
    MatIconModule
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
    private dialog: MatDialog

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

    this.clientService.getCompaniesWithClients(this.user.helpDeskCompanyId!).then(companies => {
      console.log('Empresas com clientes:', companies);
      this.companies = companies;
      // companies será um array de Company, cada uma com seu array de clients
    })
    .catch(error => {
      console.error('Erro:', error);
    });
  }

  toggleDropdown(index: number): void {
    this.activeDropdown = this.activeDropdown === index ? null : index;
  }

  updateDocument(event: any): void {
    console.log('Editar documento:', event);
    // Lógica para editar o documento
  }

  deleteDocument(client: User, company: Company): void {
    console.log('Deletar documento:', client);
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmação de exclusão!',
        message: `Você deseja deletar o cliente ${client.name}? da empresa ${company.name}`,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clientService.deleteClient(client.id).then(() => {
          this.companies = this.companies.map(company => ({
            ...company,
            clients: company.clients.filter(c => c.id !== client.id)
          }));
        }).catch(err => {
          console.error('Erro ao deletar cliente:', err);
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
      }
    });
  }
  
  
}
