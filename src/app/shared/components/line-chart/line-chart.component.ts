import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { CommonModule } from '@angular/common';
import { ChartType } from '../../../enums/chart-types.enum';
import { DynamicThreeToggleComponent } from '../dynamic-three-toggle/dynamic-three-toggle.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

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
  styleUrl: './line-chart.component.scss',
})
export class ChartComponent implements OnInit, OnChanges {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  chartInstance!: Highcharts.Chart;
  selectedToggle: string = 'ano'; // Alterado para 'ano' como padrão

  @Input() type: ChartType = ChartType.COLUMN;
  @Input() title: string = 'Gráfico de Chamados por Empresa';
  @Input() subtitle: string = '';
  @Input() chamados: {
    id: string;
    data: string;
    companyId: string;
    companyName: string;
  }[] = [];

  private readonly months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  private colorMap: Map<string, string> = new Map();

  ngOnInit(): void {
    this.buildChartOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chamados']) {
      this.colorMap.clear(); // Limpa o mapa de cores quando os dados mudam
      this.buildChartOptions();
    }
  }

  private generateColorForName(name: string): string {
    if (!this.colorMap.has(name)) {
      const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      this.colorMap.set(name, color);
    }
    return this.colorMap.get(name)!;
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

    // Encontra o ano mínimo e máximo para ajustar as categorias
    const years = new Set<number>();
    for (const chamado of chamadosFiltrados) {
      const [day, month, year] = chamado.data.split('/').map(Number);
      if (day && month && year) {
        years.add(year);
      }
    }

    const sortedYears = Array.from(years).sort();
    const categories = this.generateCategories(sortedYears);

    // Processa os dados
    for (const chamado of chamadosFiltrados) {
      const { companyId, companyName, data } = chamado;
      const [day, month, year] = data.split('/').map(Number);
      
      if (!day || !month || !year) continue;

      if (!companyMap.has(companyId)) {
        companyMap.set(companyId, {
          name: companyName,
          data: new Array(categories.length).fill(0),
        });
      }

      const date = new Date(year, month - 1, day);
      const monthIndex = date.getMonth();
      const yearIndex = sortedYears.indexOf(year);
      const categoryIndex = yearIndex * 12 + monthIndex;

      const empresa = companyMap.get(companyId);
      if (empresa && categoryIndex < empresa.data.length) {
        empresa.data[categoryIndex]++;
      }
    }

    const series: Highcharts.SeriesOptionsType[] = Array.from(companyMap.values()).map(company => ({
      type: this.type as any,
      name: company.name,
      data: company.data,
      color: this.generateColorForName(company.name),
    }));

    this.chartOptions = {
      chart: {
        type: this.type as any,
        inverted: this.type === ChartType.BAR,
      },
      title: { 
        text: this.title || 'Chamados por mês',
        align: 'left'
      },
      subtitle: {
        text: this.subtitle || `Período: ${this.getPeriodLabel()}`,
        align: 'left'
      },
      xAxis: {
        categories: categories,
        title: { text: 'Mês/Ano' },
        labels: {
          rotation: -45,
          style: {
            fontSize: '10px'
          }
        }
      },
      yAxis: {
        title: { text: 'Qtd de Chamados' },
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
        itemStyle: {
          fontSize: '12px'
        }
      },
      plotOptions: {
        series: {
          dataLabels: { 
            enabled: true,
            format: '{point.y}',
            style: {
              textOutline: 'none'
            }
          },
          enableMouseTracking: true,
        },
        column: {
          pointPadding: 0.1,
          borderWidth: 0
        }
      },
      series: series.length > 0 ? series : [{ type: 'line', data: [] }],
      credits: {
        enabled: false
      }
    };
  }

  private generateCategories(years: number[]): string[] {
    if (years.length === 0) return [];
    
    if (years.length === 1) {
      return this.months.map(month => `${month}/${years[0]}`);
    }

    const categories = [];
    for (const year of years) {
      for (const month of this.months) {
        categories.push(`${month}/${year}`);
      }
    }
    return categories;
  }

  private showNoDataMessage(): void {
    this.chartOptions = {
      title: {
        text: 'Nenhum dado disponível',
        style: {
          color: '#666666',
          fontWeight: 'bold'
        }
      },
      subtitle: {
        text: 'Não há chamados para o período selecionado',
        style: {
          color: '#999999'
        }
      },
      series: [{
        type: 'line',
        data: []
      }]
    };
  }

  private getPeriodLabel(): string {
    switch (this.selectedToggle) {
      case 'mes': return 'Últimos 30 dias';
      case 'semestre': return 'Últimos 6 meses';
      case 'ano': return 'Todos os dados disponíveis';
      default: return '';
    }
  }

  handleToggle(periodo: string) {
    this.selectedToggle = periodo;
    this.buildChartOptions();
  }

  private getFilteredChamados(): typeof this.chamados {
    if (!this.chamados || this.chamados.length === 0) return [];

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
      case 'ano':
        return this.chamados; // Mostra todos os dados sem filtro
      default:
        return this.chamados;
    }

    return this.chamados.filter(chamado => {
      try {
        const [day, month, year] = chamado.data.split('/').map(Number);
        if (isNaN(day)) return false;
        
        const dataChamado = new Date(year, month - 1, day);
        return dataChamado >= dataLimite;
      } catch {
        return false;
      }
    });
  }

  fecharTodos() {
    if (this.chartInstance) {
      this.chartInstance.series.forEach(s => s.hide());
    }
  }
}