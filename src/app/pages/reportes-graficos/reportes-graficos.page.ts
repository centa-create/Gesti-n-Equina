import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-reportes-graficos',
  standalone: true,
  imports: [CommonModule, IonicModule, BaseChartDirective],
  templateUrl: './reportes-graficos.page.html',
  styleUrls: ['./reportes-graficos.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportesGraficosPage {
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
  };
  public barChartLabels = ['Enero', 'Febrero', 'Marzo', 'Abril'];
  public barChartType: ChartType = 'bar';
  public barChartData = [
    { data: [65, 59, 80, 81], label: 'Ingresos' },
    { data: [28, 48, 40, 19], label: 'Gastos' }
  ];
}