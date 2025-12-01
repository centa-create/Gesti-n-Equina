import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { Subscription } from 'rxjs';
import { PremiumChartsComponent, ChartConfig } from '../../components/premium-charts/premium-charts.component';
import { ChartType } from 'chart.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, PremiumChartsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage implements OnInit, OnDestroy {
  userRole: string | null = null;
  connectionStatus: string = 'No probado';
  connectionData: any = null;
  isLoading: boolean = false;
  mensaje: string = '';

  // Datos de producción
  produccionData: any[] = [];
  produccionStats = {
    totalIngresos: 0,
    totalCostos: 0,
    beneficioNeto: 0,
    produccionesMes: 0
  };

  // Filtros para gráficas
  filtrosGraficas = {
    mes: new Date().getMonth(),
    anio: new Date().getFullYear()
  };
  mostrarFiltrosGraficas = false;

  // Configuración de gráficas premium
  produccionChartConfig: ChartConfig = {
    type: 'line' as ChartType,
    title: 'Producción Agrícola Mensual',
    subtitle: 'Ingresos vs Costos Operativos',
    data: [],
    labels: [],
    datasets: [],
    theme: 'agricultural',
    showLegend: true,
    showGrid: true,
    animationDuration: 2000
  };

  private authSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private firebaseService: FirebaseService
  ) {}

  async ngOnInit() {
    // Suscribirse a cambios de autenticación
    this.authSubscription = this.authService.currentUser$.subscribe(async (user) => {
      this.userRole = this.authService.getRole();

      // Solo probar conexión si el usuario está autenticado
      if (this.authService.isAuthenticated()) {
        await this.testConnection();
        await this.loadProduccionData();
      } else {
        this.connectionStatus = 'Usuario no autenticado. Inicia sesión para acceder a los datos.';
        this.mensaje = 'Por favor, inicia sesión primero.';
      }
    });
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  async testConnection() {
    this.isLoading = true;
    this.connectionStatus = 'Probando conexión con Firebase...';

    try {
      // Probar conexión obteniendo roles (no requiere autenticación)
      const roles = await this.firebaseService.getRoles();

      if (roles && roles.length > 0) {
        this.connectionStatus = '✅ Conexión exitosa con Firebase';
        this.connectionData = { rolesCount: roles.length, roles: roles };
        this.mensaje = `Conectado correctamente. ${roles.length} roles encontrados.`;

        // Si está autenticado, también obtener estadísticas
        if (this.authService.isAuthenticated()) {
          try {
            const stats = await this.firebaseService.getEstadisticasGenerales();
            this.mensaje += ` | Caballos: ${stats.caballosActivos}, Criaderos: ${stats.criaderosActivos}`;
            this.connectionData = { ...this.connectionData, stats };
          } catch (statsError) {
            console.warn('No se pudieron obtener estadísticas detalladas:', statsError);
          }
        }

        console.log('Conexión exitosa con Firebase');
      } else {
        this.connectionStatus = '⚠️ Conexión básica exitosa, pero no se encontraron roles';
        this.mensaje = 'La conexión funciona, pero verifica los datos iniciales.';
      }
    } catch (error) {
      this.connectionStatus = '❌ Error de conexión con Firebase';
      this.mensaje = 'Verifica que las reglas de seguridad estén publicadas.';
      console.error('Error al probar conexión:', error);
    } finally {
      this.isLoading = false;
    }
  }

  navigateTo(page: string) {
    this.router.navigate([page]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }

  getRoleClass(role: string | null): string {
    switch (role) {
      case 'admin': return 'role-admin';
      case 'empleado': return 'role-empleado';
      case 'visitante': return 'role-visitante';
      default: return 'role-default';
    }
  }

  getRoleIcon(role: string | null): string {
    switch (role) {
      case 'admin': return 'shield-checkmark-outline';
      case 'empleado': return 'person-outline';
      case 'visitante': return 'eye-outline';
      default: return 'person-outline';
    }
  }

  getRoleDisplayName(role: string | null): string {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'empleado': return 'Empleado';
      case 'visitante': return 'Visitante';
      default: return 'Usuario';
    }
  }

  getConnectionStatusClass(): string {
    if (this.connectionStatus.includes('exitosa') || this.connectionStatus.includes('✅')) {
      return 'status-success';
    } else if (this.connectionStatus.includes('error') || this.connectionStatus.includes('❌')) {
      return 'status-error';
    } else if (this.isLoading) {
      return 'status-loading';
    }
    return 'status-neutral';
  }

  getConnectionIcon(): string {
    if (this.connectionStatus.includes('exitosa') || this.connectionStatus.includes('✅')) {
      return 'checkmark-circle-outline';
    } else if (this.connectionStatus.includes('error') || this.connectionStatus.includes('❌')) {
      return 'close-circle-outline';
    } else if (this.isLoading) {
      return 'refresh-outline';
    }
    return 'information-circle-outline';
  }

  getConnectionTitle(): string {
    if (this.connectionStatus.includes('exitosa') || this.connectionStatus.includes('✅')) {
      return 'Conexión Establecida';
    } else if (this.connectionStatus.includes('error') || this.connectionStatus.includes('❌')) {
      return 'Error de Conexión';
    } else if (this.isLoading) {
      return 'Verificando...';
    }
    return 'Estado de Conexión';
  }

  getConnectionButtonColor(): string {
    if (this.connectionStatus.includes('exitosa') || this.connectionStatus.includes('✅')) {
      return 'success';
    } else if (this.connectionStatus.includes('error') || this.connectionStatus.includes('❌')) {
      return 'danger';
    }
    return 'primary';
  }

  async loadProduccionData() {
    try {
      // Cargar datos de producción
      this.produccionData = await this.firebaseService.getCollection('produccion') || [];

      // Calcular estadísticas
      this.produccionStats = {
        totalIngresos: this.produccionData.reduce((sum, p) => sum + (p.ingresosGenerados || 0), 0),
        totalCostos: this.produccionData.reduce((sum, p) => sum + (p.costoOperativo || 0), 0),
        beneficioNeto: 0,
        produccionesMes: this.produccionData.filter(p => {
          const fecha = new Date(p.fechaProduccion);
          const ahora = new Date();
          return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
        }).length
      };

      this.produccionStats.beneficioNeto = this.produccionStats.totalIngresos - this.produccionStats.totalCostos;

      // Generar datos para el gráfico
      this.generateChartData();

    } catch (error) {
      console.error('Error loading produccion data:', error);
    }
  }

  toggleFiltrosGraficas() {
    this.mostrarFiltrosGraficas = !this.mostrarFiltrosGraficas;
  }

  onFiltrosGraficasChange() {
    this.generateChartData();
    this.updateStats();
  }

  private generateChartData() {
    // Filtrar datos según los filtros seleccionados
    let datosFiltrados = [...this.produccionData];

    if (this.filtrosGraficas.anio) {
      datosFiltrados = datosFiltrados.filter(produccion => {
        const fecha = new Date(produccion.fechaProduccion);
        return fecha.getFullYear() === this.filtrosGraficas.anio;
      });
    }

    if (this.filtrosGraficas.mes !== null && this.filtrosGraficas.mes !== undefined) {
      datosFiltrados = datosFiltrados.filter(produccion => {
        const fecha = new Date(produccion.fechaProduccion);
        return fecha.getMonth() === this.filtrosGraficas.mes;
      });
    }

    // Agrupar datos por mes
    const monthlyData: { [key: string]: { ingresos: number; costos: number; cantidad: number } } = {};

    datosFiltrados.forEach(produccion => {
      const fecha = new Date(produccion.fechaProduccion);
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[mesKey]) {
        monthlyData[mesKey] = { ingresos: 0, costos: 0, cantidad: 0 };
      }

      monthlyData[mesKey].ingresos += produccion.ingresosGenerados || 0;
      monthlyData[mesKey].costos += produccion.costoOperativo || 0;
      monthlyData[mesKey].cantidad += 1;
    });

    // Ordenar por fecha
    const sortedMonths = Object.keys(monthlyData).sort();

    // Preparar datos para el gráfico premium
    this.produccionChartConfig = {
      ...this.produccionChartConfig,
      labels: sortedMonths.map(mes => {
        const [year, month] = mes.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      }),
      datasets: [
        {
          label: 'Ingresos ($)',
          data: sortedMonths.map(mes => monthlyData[mes].ingresos),
          backgroundColor: '#22c55e',
          borderColor: '#16a34a',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8
        },
        {
          label: 'Costos ($)',
          data: sortedMonths.map(mes => monthlyData[mes].costos),
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ]
    };
  }

  private updateStats() {
    // Actualizar estadísticas basadas en los filtros
    let datosFiltrados = [...this.produccionData];

    if (this.filtrosGraficas.anio) {
      datosFiltrados = datosFiltrados.filter(produccion => {
        const fecha = new Date(produccion.fechaProduccion);
        return fecha.getFullYear() === this.filtrosGraficas.anio;
      });
    }

    if (this.filtrosGraficas.mes !== null && this.filtrosGraficas.mes !== undefined) {
      datosFiltrados = datosFiltrados.filter(produccion => {
        const fecha = new Date(produccion.fechaProduccion);
        return fecha.getMonth() === this.filtrosGraficas.mes;
      });
    }

    this.produccionStats = {
      totalIngresos: datosFiltrados.reduce((sum, p) => sum + (p.ingresosGenerados || 0), 0),
      totalCostos: datosFiltrados.reduce((sum, p) => sum + (p.costoOperativo || 0), 0),
      beneficioNeto: 0,
      produccionesMes: datosFiltrados.length
    };

    this.produccionStats.beneficioNeto = this.produccionStats.totalIngresos - this.produccionStats.totalCostos;
  }

  getMeses(): { value: number; label: string }[] {
    return [
      { value: 0, label: 'Enero' },
      { value: 1, label: 'Febrero' },
      { value: 2, label: 'Marzo' },
      { value: 3, label: 'Abril' },
      { value: 4, label: 'Mayo' },
      { value: 5, label: 'Junio' },
      { value: 6, label: 'Julio' },
      { value: 7, label: 'Agosto' },
      { value: 8, label: 'Septiembre' },
      { value: 9, label: 'Octubre' },
      { value: 10, label: 'Noviembre' },
      { value: 11, label: 'Diciembre' }
    ];
  }

  getAnios(): number[] {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  }

  resetFiltrosGraficas() {
    this.filtrosGraficas = {
      mes: new Date().getMonth(),
      anio: new Date().getFullYear()
    };
    this.onFiltrosGraficasChange();
  }
}
