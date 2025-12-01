import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { BaseChartDirective } from 'ng2-charts';
import {
  ChartConfiguration,
  ChartType,
  ChartData
} from 'chart.js';

export interface ChartConfig {
  type: ChartType;
  title: string;
  subtitle?: string;
  data: any[];
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
    pointRadius?: number;
    pointHoverRadius?: number;
  }[];
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  animationDuration?: number;
  theme?: 'agricultural' | 'financial' | 'productivity' | 'seasonal';
}

export interface PremiumChartOptions {
  showExport?: boolean;
  showFullscreen?: boolean;
  showRefresh?: boolean;
  interactive?: boolean;
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  aspectRatio?: number;
}

@Component({
  selector: 'app-premium-charts',
  standalone: true,
  imports: [CommonModule, IonicModule, BaseChartDirective],
  templateUrl: './premium-charts.component.html',
  styleUrls: ['./premium-charts.component.scss']
})
export class PremiumChartsComponent implements OnInit, OnChanges {

  @Input() config!: ChartConfig;
  @Input() options: PremiumChartOptions = {
    showExport: true,
    showFullscreen: false,
    showRefresh: false,
    interactive: true,
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 2
  };

  @Input() loading = false;
  @Input() error: string | null = null;

  chartOptions: ChartConfiguration['options'] = {};
  chartType: ChartType = 'line';
  chartData: ChartData<any> = { datasets: [] };

  // Temas de colores agrícolas
  private agriculturalTheme = {
    primary: ['#22c55e', '#16a34a', '#15803d', '#166534'],
    secondary: ['#f59e0b', '#d97706', '#b45309', '#92400e'],
    accent: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'],
    neutral: ['#6b7280', '#4b5563', '#374151', '#1f2937']
  };

  ngOnInit() {
    this.initializeChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config'] && this.config) {
      this.initializeChart();
    }
  }

  private initializeChart() {
    if (!this.config) return;

    this.chartType = this.config.type;
    this.chartData = this.prepareChartData();
    this.chartOptions = this.createChartOptions();
  }

  private prepareChartData(): ChartData<any> {
    const theme = this.getThemeColors();

    return {
      labels: this.config.labels,
      datasets: this.config.datasets.map((dataset, index) => ({
        ...dataset,
        backgroundColor: dataset.backgroundColor || this.getBackgroundColor(index, theme),
        borderColor: dataset.borderColor || this.getBorderColor(index, theme),
        borderWidth: dataset.borderWidth || 2,
        fill: dataset.fill !== undefined ? dataset.fill : false,
        tension: dataset.tension || 0.4,
        pointRadius: dataset.pointRadius || 4,
        pointHoverRadius: dataset.pointHoverRadius || 6,
        pointBackgroundColor: this.getPointColor(index, theme),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      }))
    };
  }

  private createChartOptions(): ChartConfiguration['options'] {
    return {
      responsive: this.options.responsive ?? true,
      maintainAspectRatio: this.options.maintainAspectRatio ?? false,
      aspectRatio: this.options.aspectRatio ?? 2,

      plugins: {
        legend: {
          display: this.config.showLegend ?? true,
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              family: 'Inter, sans-serif'
            },
            color: '#374151'
          }
        },

        title: {
          display: !!this.config.title,
          text: this.config.title,
          font: {
            size: 18,
            family: 'Inter, sans-serif'
          },
          color: '#1f2937',
          padding: {
            top: 10,
            bottom: 30
          }
        },

        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          padding: 12
        }
      },

      scales: this.getScalesConfig(),

      animation: {
        duration: this.config.animationDuration || 2000
      }
    };
  }

  private getScalesConfig(): any {
    if (this.config.type !== 'pie' && this.config.type !== 'doughnut') {
      return {
        x: {
          display: true,
          grid: {
            display: this.config.showGrid ?? true,
            color: 'rgba(0, 0, 0, 0.1)',
            lineWidth: 1
          },
          ticks: {
            color: '#6b7280',
            font: {
              size: 11
            },
            padding: 10
          }
        },

        y: {
          display: true,
          beginAtZero: true,
          grid: {
            display: this.config.showGrid ?? true,
            color: 'rgba(0, 0, 0, 0.1)',
            lineWidth: 1
          },
          ticks: {
            color: '#6b7280',
            font: {
              size: 11
            },
            padding: 10,
            callback: (value: any) => {
              return this.formatAxisValue(value);
            }
          }
        }
      };
    }
    return {};
  }

  private getThemeColors() {
    return this.agriculturalTheme;
  }

  private getBackgroundColor(index: number, theme: any): string | string[] {
    if (this.config.type === 'pie' || this.config.type === 'doughnut') {
      return theme.primary.slice(0, this.config.datasets[0]?.data.length || 4);
    }

    const colors = theme.primary;
    return colors[index % colors.length] + '40'; // 40 = 25% opacity
  }

  private getBorderColor(index: number, theme: any): string | string[] {
    if (this.config.type === 'pie' || this.config.type === 'doughnut') {
      return theme.primary.slice(0, this.config.datasets[0]?.data.length || 4);
    }

    const colors = theme.primary;
    return colors[index % colors.length];
  }

  private getPointColor(index: number, theme: any): string {
    const colors = theme.primary;
    return colors[index % colors.length];
  }

  private formatAxisValue(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  }

  // Métodos públicos para interactividad
  exportChart() {
    console.log('Exporting chart...');
  }

  toggleFullscreen() {
    console.log('Toggling fullscreen...');
  }

  refreshChart() {
    this.initializeChart();
  }

  getChartHeight(): string {
    return this.config.height ? `${this.config.height}px` : '400px';
  }

  getDefaultColor(index: number): string {
    const colors = this.agriculturalTheme.primary;
    return colors[index % colors.length];
  }
}