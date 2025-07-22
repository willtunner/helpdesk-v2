import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Call, Company, User } from '../../../models/models';
import { ChartType } from '../../../enums/chart-types.enum';
import { UserType } from '../../../enums/user-types.enum';
import { AuthService } from '../../../services/auth.service';
import { HelpCompanyService } from '../../../services/help-company.service';
import { CallService } from '../../../services/call.service';
import { UserService } from '../../../services/user.service';
import { PieChartComponent } from '../../../shared/components/pie-chart/pie-chart.component';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardCardComponent } from '../../../shared/components/dashboard-card/dashboard-card.component';
import { ChartComponent } from '../../../shared/components/line-chart/line-chart.component';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../../services/translate.service';
import { CompanyService } from '../../../services/company.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, of } from 'rxjs';
import { take, catchError } from 'rxjs/operators';
import { SendNotificationService } from '../../../services/send-notification.service';
import { NotificationType } from '../../../enums/notificationType.enum';
import { MatDialog } from '@angular/material/dialog';
import { ClientsModalComponent } from '../clients-modal/clients-modal.component';
import { CallModalComponent } from '../call-modal/call-modal.component';

@Component({
  selector: 'app-operator-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule, 
    ChartComponent,
    PieChartComponent,
    DashboardCardComponent,
    TranslateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './operator-home.component.html',
  styleUrl: './operator-home.component.scss'
})
export class OperatorHomeComponent implements OnInit {
  user!: User;
  ChartType = ChartType;
  UserType = UserType;
  userRole: UserType | null = null;
  pieChartData: { name: string; y: number }[] = [];
  countCompanies: number = 0;
  clients: Company[] = []; // Array para armazenar as empresas
  countOpenCalls: number = 0;
  countClosedCalls: number = 0; 
  countAllCalls: number = 0;
  isLoading = true;

  constructor(
    private auth: AuthService,
    private helpCompanyService: HelpCompanyService,
    private callService: CallService,
    private userService: UserService,
    private translateService: TranslateService,
    private companyService: CompanyService,
    private cdr: ChangeDetectorRef,
    private messageService: SendNotificationService,
    private dialog: MatDialog
  ) {
    const session = this.auth.currentUser();
    if (session) {
      this.user = session;
      console.log('Sessão carregada:', this.user);
      console.log('ID da empresa do usuário:', this.user.helpDeskCompanyId);

      try {
        this.userRole = this.userService.getEffectiveUserRole(this.user);
        console.log('Role detectada:', this.userRole);
      } catch (err) {
        console.error('Erro ao detectar role:', err);
      }
    }
  }

  async ngOnInit(): Promise<void> {
    this.pieChartData = this.getPieData(this.chamadosMock);
  
    this.translateService.load([
      'charts.pieChart.title',
      'charts.pieChart.description',
      'dashboard.clients'
    ]);
  
    if (this.user.helpDeskCompanyId) {
      await this.loadAllData(this.user.helpDeskCompanyId); // aguarda o carregamento de todos os dados
    } else {
      console.warn('Usuário não está associado a uma empresa');
      this.isLoading = false;
    }
  
    const role = this.userService.getEffectiveUserRole(this.user);
    console.log('Função efetiva do usuário:', role);
  }

  private async loadAllData(helpDeskCompanyId: string): Promise<void> {
    try {
      const [company, clients] = await Promise.all([
        this.helpCompanyService.getHelpCompanyById(helpDeskCompanyId),
        this.companyService.getCompanyByHelpDeskId(helpDeskCompanyId)
      ]);
      
      this.clients = clients; // Armazena as empresas associadas
      this.countCompanies = clients.length;
      console.log('Quantidade de empresas associadas:', this.countCompanies, 'Empresas:', clients, 'Company:', company);
  
      forkJoin({
        open: this.callService.getCalls$(false, helpDeskCompanyId).pipe(
          take(1),
          catchError(err => {
            this.messageService.customNotification(NotificationType.ERROR, 'Erro ao buscar chamados abertos');
            return of([]);
          })
        ),
        closed: this.callService.getCalls$(true, helpDeskCompanyId).pipe(
          take(1),
          catchError(err => {
            this.messageService.customNotification(NotificationType.ERROR, 'Erro ao buscar chamados fechados');
            return of([]);
          })
        ),
        all: this.callService.getCalls$(undefined, helpDeskCompanyId).pipe(
          take(1),
          catchError(err => {
            this.messageService.customNotification(NotificationType.ERROR, 'Erro ao buscar todos os chamados');
            return of([]);
          })
        )
      }).subscribe({
        next: ({ open, closed, all }) => {
          this.countOpenCalls = open.length;
          this.countClosedCalls = closed.length;
          this.countAllCalls = all.length;
  
          console.log('Chamadas abertas:', this.countOpenCalls);
          console.log('Chamadas fechadas:', this.countClosedCalls);
          console.log('Chamadas totais:', this.countAllCalls);
        },
        error: () => {
          this.messageService.customNotification(NotificationType.ERROR, 'Erro geral ao carregar os dados de chamados');
        },
        complete: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  
    } catch (error) {
      this.messageService.customNotification(NotificationType.ERROR, 'Erro ao carregar dados da empresa');
      console.error('Erro ao carregar dados:', error);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
  
  openClientsModal(): void {
    this.dialog.open(ClientsModalComponent, {
      width: '1000px',
      panelClass: 'custom-modal',
      data: this.clients ? this.clients : []
    });
  }

  openCallsModal(type: 'open' | 'closed' | 'all'): void {
    let closed: boolean | undefined;
  
    if (type === 'open') closed = false;
    else if (type === 'closed') closed = true;
  
    this.callService.getCalls$(closed, this.user.helpDeskCompanyId).pipe(take(1)).subscribe({
      next: (calls: Call[]) => {
        this.dialog.open(CallModalComponent, {
          width: '1000px',
          panelClass: 'custom-modal',
          data: { calls, type }
        });
      },
      error: (err) => {
        this.messageService.customNotification(NotificationType.ERROR, 'Erro ao carregar chamados');
        console.error(err);
      }
    });
  }
  

  chamadosMock = [
    { id: "1", data: "07/02/2025", companyId: "1", companyName: "GreenCode" },
    { id: "2", data: "06/07/2025", companyId: "1", companyName: "GreenCode" },
    { id: "3", data: "06/01/2025", companyId: "2", companyName: "Allyenados" },
    { id: "4", data: "04/01/2025", companyId: "2", companyName: "Allyenados" },
    { id: "5", data: "04/01/2025", companyId: "2", companyName: "Allyenados" },
    { id: "6", data: "04/01/2025", companyId: "2", companyName: "Allyenados" },
    { id: "7", data: "04/07/2025", companyId: "2", companyName: "Allyenados" },
    { id: "8", data: "04/07/2025", companyId: "2", companyName: "Allyenados" },
    { id: "9", data: "04/07/2025", companyId: "2", companyName: "Allyenados" },
    { id: "10", data: "01/01/2025", companyId: "3", companyName: "Pollution" },
    { id: "11", data: "01/02/2025", companyId: "3", companyName: "Pollution" },
    { id: "12", data: "01/07/2025", companyId: "3", companyName: "Pollution" },
    { id: "13", data: "01/06/2025", companyId: "3", companyName: "Pollution" },
    { id: "14", data: "12/01/2023", companyId: "1", companyName: "GreenCode" },
    { id: "15", data: "03/03/2023", companyId: "2", companyName: "Allyenados" },
    { id: "16", data: "10/10/2023", companyId: "1", companyName: "GreenCode" },
    { id: "17", data: "12/04/2025", companyId: "1", companyName: "GreenCode" },
    { id: "18", data: "12/02/2025", companyId: "1", companyName: "GreenCode" },
    { id: "19", data: "20/05/2025", companyId: "3", companyName: "Pollution" },
    { id: "20", data: "03/03/2025", companyId: "4", companyName: "Doom" },
    { id: "21", data: "10/10/2025", companyId: "4", companyName: "Doom" },
    { id: "22", data: "12/04/2023", companyId: "4", companyName: "Doom" },
    { id: "23", data: "12/02/2024", companyId: "4", companyName: "Doom" },
    { id: "24", data: "20/05/2024", companyId: "4", companyName: "Doom" },
  ];

  getPieData(chamados: any[]) {
    const companyCounts: Record<string, number> = {};

    for (const chamado of chamados) {
      const name = chamado.companyName;
      companyCounts[name] = (companyCounts[name] || 0) + 1;
    }

    return Object.entries(companyCounts).map(([name, count]) => ({
      name,
      y: count
    }));
  }
}
