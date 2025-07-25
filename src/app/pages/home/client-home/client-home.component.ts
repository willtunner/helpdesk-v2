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

@Component({
  selector: 'app-client-home',
  standalone: true,
  imports: [
    DashboardCardComponent,
    TranslateModule,
    CommonModule,
    ChartComponent
  ],
  templateUrl: './client-home.component.html',
  styleUrl: './client-home.component.scss'
})
export class ClientHomeComponent implements OnInit {
  user!: User;
  userRole: UserType | null = null;
  ChartType = ChartType;
  isLoading = true;
  simplifiedCalls: SimplifiedCall[] = [];
  countOpenCalls: number = 0;
  countClosedCalls: number = 0;
  countAllCalls: number = 0;

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
      try {
        this.userRole = this.userService.getEffectiveUserRole(this.user);
      } catch (err) {
      }
    }
  }

  async ngOnInit(): Promise<void> {
    
    if (this.user.helpDeskCompanyId) {
      await this.loadAllData(this.user.helpDeskCompanyId);
    } else {
      console.warn('Usuário não está associado a uma empresa');
      this.isLoading = false;
    }

    const role = this.userService.getEffectiveUserRole(this.user);
    console.log('Função efetiva do usuário:', role);
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

  private async loadAllData(helpDeskCompanyId: string): Promise<void> {
    try {
      
      forkJoin({
        open: this.callService.getCalls$(false, helpDeskCompanyId).pipe(
          take(1),
          catchError(err => {
            this.messageService.customNotification(NotificationType.ERROR, 'Erro ao buscar chamados abertos');
            return of([]);
          })
        ),
        all: this.callService.getCalls$(undefined, helpDeskCompanyId).pipe(
          take(1),
          catchError(err => {
            this.messageService.customNotification(NotificationType.ERROR, 'Erro ao buscar todos os chamados');
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
        simplified: this.callService.getSimplifiedCallsFiltered(null, helpDeskCompanyId).pipe(
          take(1),
          catchError(err => {
            this.messageService.customNotification(NotificationType.ERROR, 'Erro ao buscar dados para os gráficos');
            return of([]);
          })
        )
      }).subscribe({
        next: ({ open, all, closed, simplified }) => {
          this.simplifiedCalls = simplified;
          this.countOpenCalls = open.length;
          this.countAllCalls = all.length;
          this.countClosedCalls = closed.length;

          console.log('Chamadas simplificadas:', simplified);
          console.log("abertos", open);
          console.log("fechados", closed);
          console.log("todos", all);
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
}
