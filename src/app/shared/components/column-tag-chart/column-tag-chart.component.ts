import { Component, Input, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TagService } from '../../../services/tag.service';
import { UtilService } from '../../../services/util.service';
import { CallModalComponent } from '../../../pages/home/call-modal/call-modal.component';
import { Call, ChartData } from '../../../models/models';

@Component({
  selector: 'app-column-tag-chart',
  standalone: true,
  imports: [
    HighchartsChartModule,
    CommonModule,
    TranslateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './column-tag-chart.component.html',
  styleUrls: ['./column-tag-chart.component.scss'],
  host: {
    class: 'full-width-chart'
  }
})
export class ColumnTagChartComponent {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  loading = true;
  tags: string[] = [];

  @Input() title = 'Gráfico de Colunas';
  @Input() subtitle = '';
  @Input() yAxisTitle = 'Quantidade';
  @Input() height = 500;
  @Input() showLabels = true;
  @Input() data: ChartData[] = [];
  @Input() fetchData = false;
  @Input() serviceMethod?: () => Promise<ChartData[]>;

  private callsByTag: Record<string, Call[]> = {};

  constructor(
    private tagService: TagService,
    private dialog: MatDialog,
    private utilService: UtilService
  ) {}

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (this.fetchData && this.serviceMethod) {
      this.data = await this.serviceMethod();
      await this.initializeChart();
    }
  }

  private async initializeChart(): Promise<void> {
    try {
      await this.fetchTags();
      await this.processChartData();
      this.setChartOptions();
    } catch (error) {
      console.error('Error initializing chart:', error);
    } finally {
      this.loading = false;
    }
  }

  private async processChartData(): Promise<void> {
    const tagsDataPromises = this.tags.map(async tag => {
      const { count, calls } = await this.tagService.getCallsByTag(tag);
      this.callsByTag[tag] = calls;
      return {
        name: tag,
        y: count,
        color: this.utilService.getRandomColor()
      };
    });

    this.data = await Promise.all(tagsDataPromises);
  }

  private setChartOptions(): void {
    this.chartOptions = {
      chart: {
        type: 'column',
        height: this.height,
      },
      title: { text: this.title },
      subtitle: { text: this.subtitle },
      xAxis: {
        type: 'category',
        categories: this.data.map(item => item.name),
        labels: {
          autoRotation: [-45, -90],
          style: {
            fontSize: '11px',
            fontFamily: 'Verdana, sans-serif'
          }
        }
      },
      yAxis: {
        min: 0,
        title: { text: this.yAxisTitle }
      },
      legend: { enabled: false },
      tooltip: {
        pointFormat: 'Quantidade: <b>{point.y}</b><br>Clique para mais detalhes'
      },
      plotOptions: {
        column: {
          pointPadding: 0.1,
          borderWidth: 0,
          cursor: 'pointer',
          point: {
            events: {
              click: (event) => this.openTagModal(event.point)
            }
          }
        }
      },
      series: [{
        type: 'column',
        name: 'Dados',
        colorByPoint: true,
        groupPadding: 0,
        data: this.data,
        dataLabels: {
          enabled: this.showLabels,
          rotation: 0,
          color: '#000000',
          inside: false,
          verticalAlign: 'top',
          format: '{point.y}',
          style: {
            fontSize: '13px',
            fontFamily: 'Verdana, sans-serif',
            fontWeight: 'bold'
          }
        }
      } as Highcharts.SeriesColumnOptions]
    };
  }

  private async fetchTags(): Promise<void> {
    try {
      this.tags = await this.tagService.getAllTagsByCall();
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
      this.tags = [];
    }
  }

  private openTagModal(point: Highcharts.Point): void {
    const tagName = point.name as string;
    const count = point.y as number;
    const calls = this.callsByTag[tagName] || [];

    const dialogRef = this.dialog.open(CallModalComponent, {
      width: '900px',
      data: { tagName, count, calls }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Modal fechado', result);
    });
  }
}