import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { CriaderoActivoService } from '../../services/criadero-activo.service';
import { ReportesService } from '../../services/reportes.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [IonicModule, CommonModule, BaseChartDirective],
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportesPage {
  criaderoActivo: any = null;
  reporte: any = null;

  // Configuración del gráfico
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
  };
  public barChartLabels: string[] = ['Ingresos', 'Egresos', 'Balance'];
  public barChartType: ChartType = 'bar';
  public barChartData: any[] = [];

  constructor(
    private criaderoService: CriaderoActivoService,
    private reportesService: ReportesService
  ) {
    this.criaderoService.criaderoActivo$.subscribe(c => {
      this.criaderoActivo = c;
      if (c) {
        this.reporte = this.reportesService.generarReporte(c.id);
        this.barChartData = [
          { data: [this.reporte.ingresos, this.reporte.egresos, this.reporte.balance], label: 'Finanzas' }
        ];
      }
    });
  }
}