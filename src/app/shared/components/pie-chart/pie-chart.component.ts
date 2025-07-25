import { Component, DestroyRef, effect, inject, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { TranslateService } from '../../../services/translate.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TagDetailModalComponent } from '../../../pages/home/detail-modal/tag-detail-modal.component';
import { Call } from '../../../models/models';
import { MatDialog } from '@angular/material/dialog';

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
  callsByTag: Record<string, Call[]> = {};

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};

  private translateService = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  constructor(public dialog: MatDialog,) {
    effect(() => {
      const traducoes = this.translateService.translations();
      const chamadosText = traducoes['chart.calls'] || 'Chamados';
      this.buildChart(chamadosText);
    });
  }

  ngOnInit() {
    this.translateService.load(['chart.calls']);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['title'] || changes['subtitle']) {
      const currentText = this.translateService.instant('chart.calls') || 'Chamados';
      this.buildChart(currentText);
    }
  }

  private buildChart(chamadosText: string = 'Chamados') {
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
        y: 40,
        style: { fontSize: '18px' }
      },
      subtitle: {
        text: this.subtitle,
        align: 'center',
        y: 30,
        style: { fontSize: '14px', color: '#666' }
      },
      tooltip: {
        pointFormat: `<b>{point.y} ${chamadosText}</b>`
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '{point.name}',
            style: { fontSize: '1em' }
          },
          point: {
            events: {
              click: (event) => {
                this.openTagModal(event.point );
              }
            }
          }
        }
      },
      series: [
        {
          type: 'pie',
          name: chamadosText,
          data: this.data
        }
      ]
    };
  }

  private openTagModal(point: Highcharts.Point): void {
    
    const tagName = point.name;
    const count = point.y;
  
    // Recuperar os chamados da tag clicada
    const calls = this.callsByTag[tagName] || [];
  
    const dialogRef = this.dialog.open(TagDetailModalComponent, {
      width: '600px',
      data: {
        tagName,
        count,
        calls
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('Modal de tag fechado', result);
    });
  }

  
}
