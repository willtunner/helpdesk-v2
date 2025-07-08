import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
})

export class PieChartComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};

  @Input() chamados: {
    id: string;
    data: string;
    companyId: string;
    companyName: string;
  }[] = [];

  ngOnInit() {
    this.buildChart();
  }

  private buildChart() {
    const companyCounts: Record<string, number> = {};

    for (const chamado of this.chamados) {
      const name = chamado.companyName;
      companyCounts[name] = (companyCounts[name] || 0) + 1;
    }

    const data = Object.entries(companyCounts).map(([name, count]) => ({
      // Formata o nome e a quantidade para exibição no gráfico
      name: `${name}`,
      y: count
    }));

    this.chartOptions = {
      chart: {
        type: 'pie',
        zooming: { type: 'xy' },
        panning: { enabled: true, type: 'xy' },
        panKey: 'shift'
      },
      title: {
        text: 'Distribuição de Chamados por Empresa'
      },
      subtitle: {
        text: 'Fonte: chamadosMock'
      },
      tooltip: {
        pointFormat: '<b>{point.y} chamados</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '{point.name}',
            style: {
              fontSize: '1em'
            }
          }
        }
      },
      series: [<Highcharts.SeriesPieOptions>{
        type: 'pie',
        name: 'Chamados',
        colorByPoint: true,
        data
      }]
    };
  }
}
