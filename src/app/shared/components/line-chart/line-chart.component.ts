import { Component, Input, OnChanges, OnInit, effect, inject, OnDestroy } from '@angular/core';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { CommonModule } from '@angular/common';
import { ChartType } from '../../../enums/chart-types.enum';
import { DynamicThreeToggleComponent } from '../dynamic-three-toggle/dynamic-three-toggle.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateService } from '../../../services/translate.service';
import { CallModalComponent } from '../../../pages/home/call-modal/call-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [
    CommonModule, 
    HighchartsChartModule, 
    DynamicThreeToggleComponent,
    TranslateModule,
    MatIconModule
  ],
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class ChartComponent implements OnInit, OnChanges, OnDestroy {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  chartInstance!: Highcharts.Chart;
  selectedToggle: string = 'ano';
  todasFechadas: boolean = false;
  
  // ID único para o container do gráfico
  chartId: string = 'chart-' + Math.random().toString(36).substring(2, 11);

  @Input() type: ChartType = ChartType.COLUMN;
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() chamados: {
    callId: string;
    date: string;
    companyId: string;
    companyName: string;
  }[] = [];

  private dialog = inject(MatDialog);
  private readonly months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  private colorMap: Map<string, string> = new Map();
  private translateService = inject(TranslateService);

  constructor() {}

  private readonly languageEffect = effect(() => {
    const _ = this.translateService.selectedLanguage();
    this.buildChartOptions();
  });

  ngOnInit(): void {
    // Garante que o gráfico seja inicializado com um ID único
    this.buildChartOptions();
  }

  ngOnDestroy(): void {
    if (this.chartInstance && typeof this.chartInstance.destroy === 'function') {
      try {
        this.chartInstance.destroy();
      } catch (e) {
        console.warn('Erro ao destruir chart instance:', e);
      }
    }
    this.chartInstance = null as any;
  }
  

  alternarSeries() {
    if (!this.chartInstance) return;
  
    this.todasFechadas = !this.todasFechadas;
  
    this.chartInstance.series.forEach(serie => {
      this.todasFechadas ? serie.hide() : serie.show();
    });
  }

  ngOnChanges(): void {
    this.colorMap.clear();
    this.buildChartOptions();
  }

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chartInstance = chart;
  };

  private buildChartOptions(): void {
    if (!this.chamados || this.chamados.length === 0) {
      this.showNoDataMessage();
      return;
    }

    const companyMap = new Map<string, { name: string; data: number[] }>();
    const chamadosFiltrados = this.getFilteredChamados();

    if (chamadosFiltrados.length === 0) {
      this.showNoDataMessage();
      return;
    }

    const years = new Set<number>();
    for (const chamado of chamadosFiltrados) {
      const [day, month, year] = chamado.date.split('/').map(Number);
      if (day && month && year) years.add(year);
    }

    const sortedYears = Array.from(years).sort();
    const categories = this.generateCategories(sortedYears);

    // Mapeia chamados por categoria (ex: "Jan/2024")
    const chamadosByCategory: Record<string, typeof this.chamados> = {};

    for (const chamado of chamadosFiltrados) {
      const { companyId, companyName, date } = chamado;
      const [day, month, year] = date.split('/').map(Number);
      if (!day || !month || !year) continue;

      if (!companyMap.has(companyId)) {
        companyMap.set(companyId, {
          name: companyName,
          data: new Array(categories.length).fill(0),
        });
      }

      const dateX = new Date(year, month - 1, day);
      const yearIndex = sortedYears.indexOf(year);
      const categoryIndex = yearIndex * 12 + dateX.getMonth();
      const categoryLabel = `${this.months[dateX.getMonth()]}/${year}`;

      const empresa = companyMap.get(companyId);
      if (empresa && categoryIndex < empresa.data.length) {
        empresa.data[categoryIndex]++;

        // Armazena os chamados por categoria
        if (!chamadosByCategory[categoryLabel]) {
          chamadosByCategory[categoryLabel] = [];
        }
        chamadosByCategory[categoryLabel].push(chamado);
      }
    }

    const series: Highcharts.SeriesOptionsType[] = Array.from(companyMap.values()).map(company => ({
      type: this.type as any,
      name: company.name,
      data: company.data,
      color: this.generateColorForName(company.name),
    }));

    const t = (key: string) => this.translateService.instant(key);

    this.chartOptions = {
      chart: {
        type: this.type as any,
        inverted: this.type === ChartType.BAR,
        // Container único para evitar conflitos
        renderTo: this.chartId,
        // Adiciona um ID único para a instância do gráfico
        events: {
          load: () => {
            console.log('Chart loaded in container:', this.chartId);
          }
        }
      },
      title: { 
        text: this.title || t('chart.callsByMonth'),
        align: 'left'
      },
      subtitle: {
        text: this.subtitle || `${t('chart.period')}: ${this.getPeriodLabel()}`,
        align: 'left'
      },
      xAxis: {
        categories: categories,
        title: { text: t('chart.monthYear') },
        labels: {
          rotation: -45,
          style: { fontSize: '10px' }
        }
      },
      yAxis: {
        title: { text: t('chart.callCount') },
        allowDecimals: false,
        min: 0
      },
      tooltip: {
        shared: true,
        headerFormat: '<span style="font-size:12px"><b>{point.key}</b></span><br/>',
        pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>'
      },
      legend: {
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
        itemStyle: { fontSize: '12px' }
      },
      plotOptions: {
        series: {
          dataLabels: { 
            enabled: true,
            format: '{point.y}',
            style: { textOutline: 'none' }
          },
          enableMouseTracking: true,
          cursor: 'pointer',
          point: {
            events: {
              click: (event) => {
                const category = event.point.category as string;
                const calls = chamadosByCategory[category] || [];

                this.dialog.open(CallModalComponent, {
                  width: '900px',
                  data: { category, calls }
                });
              }
            }
          }
        }
      },
      series: series.length > 0 ? series : [{ type: 'line', data: [] }],
      credits: { enabled: false }
    };
  }

  private showNoDataMessage(): void {
    const t = (key: string) => this.translateService.instant(key);

    this.chartOptions = {
      chart: {
        renderTo: this.chartId,
        events: {
          load: () => {
            console.log('No data chart loaded in container:', this.chartId);
          }
        }
      },
      title: {
        text: t('chart.noDataTitle'),
        style: { color: '#666', fontWeight: 'bold' }
      },
      subtitle: {
        text: t('chart.noDataSubtitle'),
        style: { color: '#999' }
      },
      series: [{
        type: 'line',
        data: []
      }]
    };
  }

  private generateCategories(years: number[]): string[] {
    if (years.length === 0) return [];
    const months = this.months;

    return years.length === 1
      ? months.map(m => `${m}/${years[0]}`)
      : years.flatMap(year => months.map(m => `${m}/${year}`));
  }

  private getPeriodLabel(): string {
    const t = (key: string) => this.translateService.instant(key);
    switch (this.selectedToggle) {
      case 'mes': return t('chart.last30Days');
      case 'semestre': return t('chart.last6Months');
      case 'ano': return t('chart.allAvailableData');
      default: return '';
    }
  }

  handleToggle(periodo: string) {
    this.selectedToggle = periodo;
    this.buildChartOptions();
  }

  private getFilteredChamados(): typeof this.chamados {
    if (!this.chamados?.length) return [];

    const hoje = new Date();
    let dataLimite: Date;

    switch (this.selectedToggle) {
      case 'mes':
        dataLimite = new Date(hoje);
        dataLimite.setMonth(dataLimite.getMonth() - 1);
        break;
      case 'semestre':
        dataLimite = new Date(hoje);
        dataLimite.setMonth(dataLimite.getMonth() - 6);
        break;
      default:
        return this.chamados;
    }

    return this.chamados.filter(chamado => {
      const [d, m, y] = chamado.date.split('/').map(Number);
      if (isNaN(d)) return false;
      return new Date(y, m - 1, d) >= dataLimite;
    });
  }

  private generateColorForName(name: string): string {
    if (!this.colorMap.has(name)) {
      const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      this.colorMap.set(name, color);
    }
    return this.colorMap.get(name)!;
  }

  fecharTodos() {
    if (this.chartInstance) {
      this.chartInstance.series.forEach(s => s.hide());
    }
  }
}