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

  deleteDocument(event: any): void {
    console.log('Deletar documento:', event);
    // Lógica para deletar o documento
  }
  
  
}
