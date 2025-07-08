import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { CommonModule } from '@angular/common';
import { ChartType } from '../../../enums/chart-types.enum';
import { DynamicThreeToggleComponent } from '../dynamic-three-toggle/dynamic-three-toggle.component';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule, DynamicThreeToggleComponent],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
})
export class ChartComponent implements OnInit, OnChanges {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  chartInstance!: Highcharts.Chart;
  selectedToggle: string = 'mes';

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
    this.buildChartOptions();
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
    // ❌ REMOVIDO o botão extra criado via renderer
  };

  private buildChartOptions(): void {
    const companyMap = new Map<string, { name: string; data: number[] }>();
    const chamadosFiltrados = this.getFilteredChamados();

    for (const chamado of chamadosFiltrados) {
      const { companyId, companyName, data } = chamado;

      if (!companyMap.has(companyId)) {
        companyMap.set(companyId, {
          name: companyName,
          data: new Array(12).fill(0),
        });
      }

      const [day, month, year] = data.split('/').map(Number);
      if (!day || !month || !year) continue;

      const date = new Date(year, month - 1, day);
      const monthIndex = date.getMonth();

      const empresa = companyMap.get(companyId);
      if (empresa) {
        empresa.data[monthIndex]++;
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
        inverted: this.type === ChartType.BAR ? false : undefined,
      },
      title: { text: this.title || 'Chamados por mês!' },
      xAxis: {
        categories: this.months,
        title: { text: 'Mês' },
      },
      yAxis: {
        title: { text: 'Qtd de Chamados' },
        allowDecimals: false,
      },
      tooltip: {
        shared: true,
      },
      legend: {
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
      },
      plotOptions: {
        series: {
          dataLabels: { enabled: true },
          enableMouseTracking: true,
        },
      },
      series,
    };
  }

  handleToggle(periodo: string) {
    this.selectedToggle = periodo;
    this.buildChartOptions();
  }

  private getFilteredChamados(): typeof this.chamados {
    const hoje = new Date();
    let dataLimite: Date;

    switch (this.selectedToggle) {
      case 'mes':
        dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - 30);
        break;
      case 'semestre':
        dataLimite = new Date();
        dataLimite.setMonth(dataLimite.getMonth() - 6);
        break;
      case 'ano':
        dataLimite = new Date(hoje.getFullYear(), 0, 1);
        break;
      default:
        return this.chamados;
    }

    return this.chamados.filter(chamado => {
      const [day, month, year] = chamado.data.split('/').map(Number);
      const dataChamado = new Date(year, month - 1, day);
      return dataChamado >= dataLimite;
    });
  }

  fecharTodos() {
    if (this.chartInstance) {
      this.chartInstance.series.forEach(s => s.hide());
    }
  }
}
