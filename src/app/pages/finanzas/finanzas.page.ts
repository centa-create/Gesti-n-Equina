import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CriaderoActivoService } from '../../services/criadero-activo.service';
import { FinanzasService } from '../../services/finanzas.service';
import { Transaccion, ResumenFinanciero, CategoriaFinanciera } from '../../models/transaccion';
import { PremiumChartsComponent, ChartConfig } from '../../components/premium-charts/premium-charts.component';
import { FirestoreDatePipe } from '../../pipes/firestore-date.pipe';

@Component({
  selector: 'app-finanzas',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PremiumChartsComponent, FirestoreDatePipe],
  templateUrl: './finanzas.page.html',
  styleUrls: ['./finanzas.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinanzasPage implements OnInit {
  criaderoActivo: any = null;
  transacciones: Transaccion[] = [];
  resumen: ResumenFinanciero | null = null;
  categorias: CategoriaFinanciera[] = [];
  nuevaTransaccion: Partial<Transaccion> = {
    tipo: 'gasto',
    fecha: new Date().toISOString().split('T')[0] + 'T12:00:00.000Z'
  };

  isLoading = false;
  showForm = false;
  filtroTipo: 'todos' | 'ingreso' | 'gasto' = 'todos';
  filtroCategoria = '';

  // Configuración del gráfico mensual
  chartConfig: ChartConfig | null = null;

  constructor(
    private criaderoService: CriaderoActivoService,
    private finanzasService: FinanzasService,
    private router: Router
  ) {}

  ngOnInit() {
    this.categorias = this.finanzasService.categorias;

    this.criaderoService.criaderoActivo$.subscribe(c => {
      this.criaderoActivo = c;
      if (c) {
        this.cargarDatos();
      }
    });
  }

  cargarDatos() {
    if (!this.criaderoActivo) return;

    this.isLoading = true;

    // Cargar transacciones
    this.finanzasService.getTransacciones(this.criaderoActivo.id).subscribe({
      next: (transacciones) => {
        this.transacciones = transacciones;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando transacciones:', err);
        this.isLoading = false;
      }
    });

    // Cargar resumen financiero
    this.finanzasService.getResumenFinanciero(this.criaderoActivo.id).subscribe({
      next: (resumen) => {
        this.resumen = resumen;
        this.generarGraficoMensual();
      },
      error: (err) => {
        console.error('Error cargando resumen:', err);
      }
    });
  }

  get transaccionesFiltradas(): Transaccion[] {
    return this.transacciones.filter(t => {
      const tipoMatch = this.filtroTipo === 'todos' || t.tipo === this.filtroTipo;
      const categoriaMatch = !this.filtroCategoria || t.categoria === this.filtroCategoria;
      return tipoMatch && categoriaMatch;
    }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  crearTransaccion() {
    if (!this.nuevaTransaccion.descripcion || !this.nuevaTransaccion.monto ||
        !this.nuevaTransaccion.tipo || !this.nuevaTransaccion.categoria ||
        !this.criaderoActivo) {
      return;
    }

    const transaccion: Omit<Transaccion, 'id'> = {
      criaderoId: this.criaderoActivo.id,
      tipo: this.nuevaTransaccion.tipo,
      categoria: this.nuevaTransaccion.categoria,
      descripcion: this.nuevaTransaccion.descripcion,
      monto: this.nuevaTransaccion.monto,
      fecha: this.nuevaTransaccion.fecha || new Date().toISOString(),
      caballoId: this.nuevaTransaccion.caballoId,
      eventoId: this.nuevaTransaccion.eventoId,
      proveedor: this.nuevaTransaccion.proveedor,
      metodoPago: this.nuevaTransaccion.metodoPago,
      notas: this.nuevaTransaccion.notas
    };

    this.isLoading = true;
    this.finanzasService.crearTransaccion(transaccion).subscribe({
      next: () => {
        this.cargarDatos();
        this.nuevaTransaccion = {
          tipo: 'gasto',
          fecha: new Date().toISOString().split('T')[0] + 'T12:00:00.000Z'
        };
        this.showForm = false;
        this.isLoading = false;
        this.generarGraficoMensual();
      },
      error: (err) => {
        console.error('Error creando transacción:', err);
        this.isLoading = false;
      }
    });
  }

  eliminarTransaccion(id: number) {
    if (confirm('¿Está seguro de eliminar esta transacción?')) {
      this.isLoading = true;
      this.finanzasService.eliminarTransaccion(id).subscribe({
        next: () => {
          this.cargarDatos();
          this.isLoading = false;
          this.generarGraficoMensual();
        },
        error: (err) => {
          console.error('Error eliminando transacción:', err);
          this.isLoading = false;
        }
      });
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  getCategoriaNombre(categoriaId: string): string {
    const categoria = this.categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nombre : categoriaId;
  }

  getTipoColor(tipo: string): string {
    return tipo === 'ingreso' ? 'success' : 'danger';
  }

  formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(monto);
  }

  // Generar gráfico mensual de ingresos vs gastos
  generarGraficoMensual() {
    if (!this.transacciones || this.transacciones.length === 0) {
      this.chartConfig = null;
      return;
    }

    // Agrupar transacciones por mes
    const datosPorMes = new Map<string, { ingresos: number; gastos: number }>();

    this.transacciones.forEach(transaccion => {
      const fecha = new Date(transaccion.fecha);
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const mesNombre = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });

      if (!datosPorMes.has(mesKey)) {
        datosPorMes.set(mesKey, { ingresos: 0, gastos: 0 });
      }

      const datosMes = datosPorMes.get(mesKey)!;
      if (transaccion.tipo === 'ingreso') {
        datosMes.ingresos += transaccion.monto;
      } else {
        datosMes.gastos += transaccion.monto;
      }
    });

    // Ordenar por fecha
    const entradasOrdenadas = Array.from(datosPorMes.entries())
      .sort(([a], [b]) => a.localeCompare(b));

    const labels = entradasOrdenadas.map(([mesKey]) => {
      const [year, month] = mesKey.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short'
      });
    });

    const ingresosData = entradasOrdenadas.map(([, datos]) => datos.ingresos);
    const gastosData = entradasOrdenadas.map(([, datos]) => datos.gastos);

    this.chartConfig = {
      type: 'line',
      title: 'Tendencia Mensual de Finanzas',
      subtitle: 'Ingresos vs Gastos',
      labels: labels,
      data: [],
      datasets: [
        {
          label: 'Ingresos',
          data: ingresosData,
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderColor: '#22c55e',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8
        },
        {
          label: 'Gastos',
          data: gastosData,
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: '#ef4444',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ],
      height: 350,
      showLegend: true,
      showGrid: true,
      animationDuration: 1500,
      theme: 'financial'
    };
  }

  irACriaderos() {
    this.router.navigate(['/criaderos']);
  }

  // Métodos legacy para compatibilidad
  agregarRegistro(descripcion: string | number | null | undefined, monto: string | number | null | undefined) {
    // Legacy method - replaced by crearTransaccion
    console.warn('agregarRegistro is deprecated');
  }

  eliminarRegistro(id: number) {
    // Legacy method - replaced by eliminarTransaccion
    this.eliminarTransaccion(id);
  }
}