import { Component, forwardRef, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { RichTextEditorComponent } from '../../shared/components/rich-text/rich-text.component';
import { MatInputModule } from '@angular/material/input';
import { ThemeService } from '../../services/theme.service';
import { ChartComponent } from '../../shared/components/line-chart/line-chart.component';
import { ChartType } from '../../enums/chart-types.enum';
import { PieChartComponent } from '../../shared/components/pie-chart/pie-chart.component';
import { User } from '../../models/models';
import { DashboardCardComponent } from '../../shared/components/dashboard-card/dashboard-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { HelpCompanyService } from '../../services/help-company.service';
import { CallService } from '../../services/call.service';
import { UserService } from '../../services/user.service';
import { ClientHomeComponent } from './client-home/client-home.component';
import { OperatorHomeComponent } from './operator-home/operator-home.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { MasterHomeComponent } from './master-home/master-home.component';
import { UserType } from '../../enums/user-types.enum';

@Component({
  selector: 'app-home',
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
    ClientHomeComponent,
    OperatorHomeComponent,
    AdminHomeComponent,
    MasterHomeComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ]
})

export class HomeComponent implements OnInit {
  user!: User;
  ChartType = ChartType;
  UserType = UserType;
  userRole: UserType | null = null;
  pieChartData: { name: string; y: number }[] = [];

  constructor(
    private auth: AuthService,
    private helpCompanyService: HelpCompanyService,
    private callService: CallService,
    private userService: UserService
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

    if (this.user.helpDeskCompanyId) {
      this.callService.getCallsByHelpDeskCompany$(this.user.helpDeskCompanyId, this.user.id)
        .subscribe(calls => {
          console.log('Chamadas da empresa:', calls);
        });
    }

    const role = this.userService.getEffectiveUserRole(this.user);
    console.log('Função efetiva do usuário:', role);
  }

  

}

