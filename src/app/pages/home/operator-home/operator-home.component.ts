import { Component } from '@angular/core';
import { User } from '../../../models/models';
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
        PieChartComponent,
  ],
  templateUrl: './operator-home.component.html',
  styleUrl: './operator-home.component.scss'
})
export class OperatorHomeComponent {
user!: User;
  ChartType = ChartType;
  UserType = UserType;
  userRole: UserType | null = null;
  pieChartData: { name: string; y: number }[] = [];

  constructor(
    private auth: AuthService,
    private helpCompanyService: HelpCompanyService,
    private callService: CallService,
    private userService: UserService,
    private translateService: TranslateService
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

      if (this.user.helpDeskCompanyId) {
        this.helpCompanyService.getHelpCompanyById(this.user.helpDeskCompanyId)
          .then(company => {
            if (company) {
              console.log('Empresa do usuário:', company);
            } else {
              console.error('Empresa não encontrada');
            }
          })
          .catch(error => {
            console.error('Erro ao buscar empresa:', error);
          });
      } else {
        console.warn('Usuário não está associado a uma empresa');
      }
    }
  }

  ngOnInit(): void {
    this.pieChartData = this.getPieData(this.chamadosMock);

    this.translateService.load([
      'charts.pieChart.title',
      'charts.pieChart.description',
      'dashboard.clients'
    ]);

    if (this.user.helpDeskCompanyId) {
      this.callService.getCallsByHelpDeskCompany$(this.user.helpDeskCompanyId, this.user.id)
        .subscribe(calls => {
          console.log('Chamadas da empresa:', calls);
        });
    }

    const role = this.userService.getEffectiveUserRole(this.user);
    console.log('Função efetiva do usuário:', role);
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
