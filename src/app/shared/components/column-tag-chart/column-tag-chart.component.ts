import { Component, Input, SimpleChanges, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TagService } from '../../../services/tag.service';
import { UtilService } from '../../../services/util.service';
import { CallModalComponent } from '../../../pages/home/call-modal/call-modal.component';
import { Call, ChartData } from '../../../models/models';
import { Subscription } from 'rxjs';

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
export class ColumnTagChartComponent implements OnInit, OnDestroy {
  // Configuração do Highcharts
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chartInstance = chart;
  };

  // Estados do componente
  loading = true;
  tags: string[] = [];
  data: ChartData[] = [];

  // Inputs com valores padrão
  @Input() titleKey = 'chart.title';
  @Input() subtitleKey = 'chart.subtitle';
  @Input() yAxisTitleKey = 'chart.yAxisTitle';
  @Input() height = 500;
  @Input() showLabels = true;
  @Input() fetchData = false;
  @Input() serviceMethod?: () => Promise<ChartData[]>;

  // Privates
  private translateSubscription!: Subscription;
  private chartInstance!: Highcharts.Chart;
  private callsByTag: Map<string, Call[]> = new Map();
  private chartId = `tag-chart-${Math.random().toString(36).substring(2, 11)}`;

  constructor(
    private tagService: TagService,
    private dialog: MatDialog,
    private utilService: UtilService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.setupLanguageSubscription();
  }

  ngOnDestroy(): void {
    this.cleanupSubscriptions();
    this.destroyChart();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (this.shouldFetchData(changes)) {
      await this.initializeChart();
    }

    if (this.shouldUpdateTranslations(changes)) {
      this.updateChartTranslations();
    }
  }

  // Métodos privados principais
  private async initializeChart(): Promise<void> {
    try {
      this.loading = true;
      await this.loadChartData();
    } catch (error) {
      console.error('Error initializing chart:', error);
      this.setEmptyChartState();
    } finally {
      this.loading = false;
    }
  }

  private async loadChartData(): Promise<void> {
    if (this.serviceMethod && this.fetchData) {
      this.data = await this.serviceMethod();
    } else {
      await this.fetchTags();
      await this.processChartDataOptimized();
    }
    
    this.setChartOptions();
  }

  private async processChartDataOptimized(): Promise<void> {
    if (this.tags.length === 0) return;

    try {
      const tagDataMap = await this.tagService.getCallsByMultipleTags(this.tags);
      
      this.data = this.tags.map(tag => {
        const upperTag = tag.toUpperCase();
        const tagData = tagDataMap.get(upperTag) || { count: 0, calls: [] };
        
        this.callsByTag.set(tag, tagData.calls);
        
        return {
          name: tag,
          y: tagData.count,
          color: this.utilService.getRandomColor()
        };
      });
    } catch (error) {
      console.error('Error processing chart data:', error);
      throw error;
    }
  }

  private setChartOptions(): void {
    this.chartOptions = {
      chart: {
        type: 'column',
        height: this.height,
        events: {
          load: () => console.log('Chart loaded successfully')
        }
      },
      title: { 
        text: this.translate.instant(this.titleKey) 
      },
      subtitle: { 
        text: this.translate.instant(this.subtitleKey) 
      },
      xAxis: this.getXAxisConfig(),
      yAxis: this.getYAxisConfig(),
      legend: { enabled: false },
      tooltip: this.getTooltipConfig(),
      plotOptions: this.getPlotOptionsConfig(),
      series: [this.getSeriesConfig()]
    };
  }

  // Métodos de configuração
  private getXAxisConfig(): Highcharts.XAxisOptions {
    return {
      type: 'category',
      categories: this.data.map(item => item.name),
      labels: {
        autoRotation: [-45, -90],
        style: {
          fontSize: '11px',
          fontFamily: 'Verdana, sans-serif'
        }
      }
    };
  }

  private getYAxisConfig(): Highcharts.YAxisOptions {
    return {
      min: 0,
      title: { 
        text: this.translate.instant(this.yAxisTitleKey) 
      }
    };
  }

  private getTooltipConfig(): Highcharts.TooltipOptions {
    return {
      pointFormat: this.translate.instant('chart.tooltip.pointFormat')
    };
  }

  private getPlotOptionsConfig(): Highcharts.PlotOptions {
    return {
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
    };
  }

  private getSeriesConfig(): Highcharts.SeriesColumnOptions {
    return {
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
    };
  }

  // Métodos auxiliares
  private async fetchTags(): Promise<void> {
    try {
      this.tags = await this.tagService.getAllTagsByCall();
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
      this.tags = [];
    }
  }

  private async openTagModal(point: Highcharts.Point): Promise<void> {
    const tagName = point.name as string;
    const count = point.y as number;
    // Busca os chamados completos da tag (sem confiar só no cache local)
    const calls = await this.tagService.getCallsByTag(tagName);
    this.dialog.open(CallModalComponent, {
      width: '900px',
      data: { tagName, count, calls }
    });
  }

  private updateChartTranslations(): void {
    if (!this.chartInstance || !this.chartOptions) return;

    const updatedOptions: Highcharts.Options = {
      title: { text: this.translate.instant(this.titleKey) },
      subtitle: { text: this.translate.instant(this.subtitleKey) },
      yAxis: { title: { text: this.translate.instant(this.yAxisTitleKey) } },
      tooltip: { pointFormat: this.translate.instant('chart.tooltip.pointFormat') }
    };

    this.chartInstance.update(updatedOptions, true, false);
  }

  private setupLanguageSubscription(): void {
    this.translateSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateChartTranslations();
    });
  }

  private cleanupSubscriptions(): void {
    if (this.translateSubscription) {
      this.translateSubscription.unsubscribe();
    }
  }

  private destroyChart(): void {
    if (this.chartInstance) {
      try {
        this.chartInstance.destroy();
      } catch (e) {
        console.warn('Error destroying chart:', e);
      }
    }
  }

  private setEmptyChartState(): void {
    this.data = [];
    this.tags = [];
    this.callsByTag.clear();
  }

  private shouldFetchData(changes: SimpleChanges): boolean {
    return !!this.fetchData && 
           !!this.serviceMethod && 
           ((changes['fetchData']?.firstChange ?? false) || 
            (changes['serviceMethod']?.firstChange ?? false));
  }

  private shouldUpdateTranslations(changes: SimpleChanges): boolean {
    return !changes['titleKey']?.firstChange || 
           !changes['subtitleKey']?.firstChange || 
           !changes['yAxisTitleKey']?.firstChange;
  }
}