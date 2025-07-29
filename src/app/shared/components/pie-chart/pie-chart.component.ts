import { Component, DestroyRef, effect, inject, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { TranslateService } from '../../../services/translate.service';
import { Call } from '../../../models/models';
import { MatDialog } from '@angular/material/dialog';
import { CallService } from '../../../services/call.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CallModalComponent } from '../../../pages/home/call-modal/call-modal.component';

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

  constructor(public dialog: MatDialog, private callService: CallService) {
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
                this.openCallModal(event.point);
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

  private openCallModal(point: any): void {
    const tagName = point.name;
    const count = point.y;
  
    const callIds: string[] =
      Array.isArray(point.calls)
        ? point.calls.map((c: any) => c.callId).filter((id: any) => typeof id === 'string')
        : [];
  
    if (callIds.length === 0) {
      console.warn('Nenhum callId válido encontrado em point.calls');
      return;
    }
  
    this.callService.getCallsByIds(callIds).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (calls: Call[]) => {
        console.log("")
        this.dialog.open(CallModalComponent, {
          width: '600px',
          data: { tagName, count, calls }
        });
      },
      error: (err) => {
        console.error('Erro ao abrir modal com chamados:', err);
      }
    });
  }
  
  

  
}
