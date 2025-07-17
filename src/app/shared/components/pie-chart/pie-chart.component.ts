import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
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
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() data: { name: string; y: number }[] = [];

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};

  ngOnInit() {
    this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['title'] || changes['subtitle']) {
      this.buildChart();
    }
  }

  private buildChart() {
    this.chartOptions = {
      chart: {
        type: 'pie',
        zooming: { type: 'xy' },
        panning: { enabled: true, type: 'xy' },
        panKey: 'shift'
      },
      title: {
        text: this.title,
        align: 'center',
        y: 100, // ajustado
        style: { fontSize: '18px' }
      },
      subtitle: {
        text: this.subtitle,
        align: 'center',
        y: 30, // ajustado
        style: { fontSize: '14px', color: '#666' }
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
            style: { fontSize: '1em' }
          }
        }
      },
      series: [
        {
          type: 'pie',
          name: 'Chamados',
          data: this.data
        }
      ]
    };
  }
  
}
