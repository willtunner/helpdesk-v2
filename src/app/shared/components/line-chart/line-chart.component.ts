import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { CommonModule } from '@angular/common';
import { ChartType } from '../../../enums/chart-types.enum';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
})
export class ChartComponent implements OnInit, OnChanges {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  chartInstance!: Highcharts.Chart;


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
  
    // Evita botão duplicado
    if ((chart as any).customCloseAllButton) {
      (chart as any).customCloseAllButton.destroy();
    }
  
    // Cria botão "Fechar Todos"
    const button = chart.renderer
      .text('❌ Fechar Todos', chart.plotLeft, chart.plotTop - 20)
      .css({
        color: '#007bff',
        cursor: 'pointer',
        fontSize: '14px'
      })
      .on('click', () => {
        chart.series.forEach(s => s.hide());
      })
      .add();
  
    (chart as any).customCloseAllButton = button;
  };

  private buildChartOptions() {
    const companyMap = new Map<string, { name: string; data: number[] }>();
  
    for (const chamado of this.chamados) {
      const { companyId, companyName, data } = chamado;
  
      if (!companyMap.has(companyId)) {
        companyMap.set(companyId, {
          name: companyName,
          data: new Array(12).fill(0)
        });
      }
  
      const [day, month, year] = data.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      const monthIndex = date.getMonth();
  
      companyMap.get(companyId)!.data[monthIndex]++;
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
        inverted: this.type === ChartType.BAR ? false : undefined
      },
      title: { text: this.title || 'Chamados por mês!' },
      xAxis: {
        categories: this.months,
        title: { text: 'Mês' }
      },
      yAxis: {
        title: { text: 'Qtd de Chamados' }
      },
      tooltip: {
        shared: true,
      },
      legend: {
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom'
      },
      plotOptions: {
        series: {
          dataLabels: { enabled: true },
          enableMouseTracking: true
        }
      },
      series
    };
    
    setTimeout(() => {
      if (Highcharts.charts[0]) {
        const chart = Highcharts.charts[0];
        if (chart) {
          // Evita duplicação do botão
          const existingButton = (chart as any).customCloseAllButton;
          if (existingButton) {
            existingButton.destroy();
          }
    
          // Cria o botão "Fechar Todos"
          const button = chart.renderer
            .text('❌ Fechar Todos', chart.plotLeft, chart.plotTop - 20)
            .css({
              color: '#007bff',
              cursor: 'pointer',
              fontSize: '14px'
            })
            .on('click', function () {
              chart.series.forEach(s => s.hide());
            })
            .add();
    
          (chart as any).customCloseAllButton = button;
        }
      }
    }, 0);
    
  }
  
  
  
}
