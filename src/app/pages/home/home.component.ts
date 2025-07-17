import { Component, forwardRef, OnInit, signal, Signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomInputComponent } from '../../shared/components/custom-input/custom-input.component';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { DynamicTableComponent } from '../../shared/components/dynamic-table/dynamic-table.component';
import { DynamicButtonComponent } from '../../shared/components/action-button/action-button.component';
import { MatIconModule } from '@angular/material/icon';
import { DynamicThreeToggleComponent } from '../../shared/components/dynamic-three-toggle/dynamic-three-toggle.component';
import { RichTextEditorComponent } from '../../shared/components/rich-text/rich-text.component';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { cnpjValidator, cpfValidator } from '../../shared/validators/validators';
import { ChartComponent } from '../../shared/components/line-chart/line-chart.component';
import { ChartType } from '../../enums/chart-types.enum';
import { PieChartComponent } from '../../shared/components/pie-chart/pie-chart.component';
import { DropdownVideosComponent } from '../../shared/components/dropdown-videos/dropdown-videos.component';
import { DropDownVideos } from '../../models/models';
import { Observable } from 'rxjs';
import { VideoService } from '../../services/videoService.service';
import { MtbDevComponent } from '../../shared/components/mtb-dev/mtb-dev.component';
import { NumberCounterComponent } from '../../shared/components/number-counter/number-counter.component';
import { UserService } from '../../services/user.service';
import { DynamicSelectComponent } from '../../shared/components/dynamic-select/dynamic-select.component';
import { DashboardCardComponent } from '../../shared/components/dashboard-card/dashboard-card.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomInputComponent, MatButtonModule,
    DynamicTableComponent, DynamicButtonComponent, MatIconModule, DynamicThreeToggleComponent,
    RichTextEditorComponent, MatInputModule, ChartComponent, NumberCounterComponent,
    PieChartComponent, DropdownVideosComponent, MtbDevComponent, DynamicSelectComponent,
    DashboardCardComponent, TranslateModule
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
  user: any = null;

  constructor(
    private auth: AuthService,
  ) {

    const session = this.auth.currentUser();
    if (session) {
      this.user = session;
      console.log('Sessão carregada:', this.user);
    }
  }

  ngOnInit(): void {

  }

}

