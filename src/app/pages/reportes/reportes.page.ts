import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { CriaderoActivoService } from '../../services/criadero-activo.service';
import { ReportesService } from '../../services/reportes.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportesPage implements OnInit {
  criaderoActivo: any = null;
  reporte: any = null;
  isLoading = false;
  fechaActual = new Date();

  // Filtros de exportación
  fechaInicioExport = '';
  fechaFinExport = '';
  tipoReporteExport = 'completo';

  // Modal de crear reporte
  showCrearReporteModal = false;
  nuevoReporte: any = {
    nombre: '',
    descripcion: '',
    periodo: 'mensual',
    fechaInicio: '',
    fechaFin: '',
    incluirCaballos: true,
    incluirFinanzas: true,
    incluirServicios: true,
    incluirInventario: true,
    formato: 'pdf',
    frecuencia: 'manual'
  };

  // Configuración del gráfico
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 2,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Análisis Financiero Mensual',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => {
            return '$' + value.toLocaleString('es-CO');
          }
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };
  public barChartLabels: string[] = [];
  public barChartType: ChartType = 'line';
  public barChartData: any[] = [];

  constructor(
    private criaderoService: CriaderoActivoService,
    private reportesService: ReportesService
  ) {}

  ngOnInit() {
    console.log('ReportesPage: Inicializando...');
    this.criaderoService.criaderoActivo$.subscribe(c => {
      console.log('ReportesPage: Criadero activo cambió:', c);
      this.criaderoActivo = c;
      if (c) {
        this.cargarReporte();
      } else {
        console.log('ReportesPage: No hay criadero activo');
        this.reporte = null;
        this.barChartData = [];
      }
    });
  }

  cargarReporte() {
    if (!this.criaderoActivo) {
      console.log('ReportesPage: No hay criadero activo, no se carga reporte');
      return;
    }

    console.log('ReportesPage: Cargando reporte para criadero:', this.criaderoActivo.id);
    this.isLoading = true;
    this.reportesService.generarReporte(this.criaderoActivo.id).subscribe({
      next: (reporte) => {
        console.log('ReportesPage: Reporte cargado exitosamente:', reporte);
        this.reporte = reporte;
        this.barChartData = [
          {
            data: [reporte.ingresos, Math.abs(reporte.egresos), reporte.balance],
            label: 'Finanzas',
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',  // Verde para ingresos
              'rgba(239, 68, 68, 0.8)',  // Rojo para egresos
              reporte.balance >= 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)' // Azul o rojo para balance
            ],
            borderColor: [
              '#22c55e',
              '#ef4444',
              reporte.balance >= 0 ? '#3b82f6' : '#ef4444'
            ],
            borderWidth: 2
          }
        ];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('ReportesPage: Error cargando reporte:', error);
        this.isLoading = false;
        // Mostrar datos por defecto en caso de error
        this.reporte = {
          totalCaballos: 0,
          ingresos: 0,
          egresos: 0,
          balance: 0,
          caballosActivos: 0,
          finanzasCount: 0
        };
      }
    });
  }

  // ====================
  // MÉTODOS PARA LA NUEVA INTERFAZ
  // ====================

  verDetalleEstadistica(tipo: string) {
    // Aquí se podría implementar navegación a vistas detalladas
    console.log('Ver detalle de estadística:', tipo);
    // Por ahora, mostrar alerta simple
    const mensajes: { [key: string]: string } = {
      'caballos': 'Estadísticas detalladas de caballos próximamente',
      'finanzas': 'Análisis financiero detallado próximamente',
      'servicios': 'Reportes de servicios veterinarios próximamente',
      'inventario': 'Control de inventario próximamente'
    };
    alert(mensajes[tipo] || 'Funcionalidad próximamente');
  }

  // ====================
  // MÉTODOS PARA CREAR REPORTES
  // ====================

  crearReporte() {
    this.showCrearReporteModal = true;
  }

  cerrarModalCrearReporte() {
    this.showCrearReporteModal = false;
    this.resetNuevoReporte();
  }

  resetNuevoReporte() {
    this.nuevoReporte = {
      nombre: '',
      descripcion: '',
      periodo: 'mensual',
      fechaInicio: '',
      fechaFin: '',
      incluirCaballos: true,
      incluirFinanzas: true,
      incluirServicios: true,
      incluirInventario: true,
      formato: 'pdf',
      frecuencia: 'manual'
    };
  }

  generarReportePersonalizado() {
    if (!this.nuevoReporte.nombre) {
      alert('Por favor ingresa un nombre para el reporte');
      return;
    }

    if (!this.nuevoReporte.incluirCaballos && !this.nuevoReporte.incluirFinanzas &&
        !this.nuevoReporte.incluirServicios && !this.nuevoReporte.incluirInventario) {
      alert('Debes seleccionar al menos un módulo para incluir en el reporte');
      return;
    }

    // Aquí se implementaría la lógica real de generación de reportes
    console.log('Generando reporte personalizado:', this.nuevoReporte);

    // Simular generación de reporte
    alert(`Reporte "${this.nuevoReporte.nombre}" generado exitosamente.\n\nFormato: ${this.nuevoReporte.formato.toUpperCase()}\nFrecuencia: ${this.nuevoReporte.frecuencia}\n\nLa descarga comenzará automáticamente.`);

    this.cerrarModalCrearReporte();
  }

  exportarPDF() {
    // Implementación básica de exportación PDF
    console.log('Exportando PDF con filtros:', {
      fechaInicio: this.fechaInicioExport,
      fechaFin: this.fechaFinExport,
      tipo: this.tipoReporteExport
    });

    // Aquí se implementaría la lógica real de exportación
    alert('Funcionalidad de exportación PDF próximamente disponible');
  }
}