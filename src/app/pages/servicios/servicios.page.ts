import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { AdvancedFiltersComponent, FilterConfig, FilterValues } from '../../components/advanced-filters/advanced-filters.component';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.page.html',
  styleUrls: ['./servicios.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, AdvancedFiltersComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiciosPage implements OnInit {
  userRole: string | null = null;
  canEdit: boolean = false;
  servicios: any[] = [];
  serviciosFiltrados: any[] = [];
  caballos: any[] = [];
  isLoading = false;
  showForm = false;

  nuevoServicio: any = {
    caballoId: '',
    tipoServicio: 'herraje',
    descripcion: '',
    costo: 0,
    fechaRealizacion: '',
    proximaFecha: '',
    observaciones: ''
  };

  // Configuración de filtros avanzados
  filtrosConfig: FilterConfig = {
    title: 'Servicios',
    fields: [
      {
        key: 'busqueda',
        label: 'Buscar',
        type: 'text',
        placeholder: 'Tipo, descripción, caballo...'
      },
      {
        key: 'tipoServicio',
        label: 'Tipo de servicio',
        type: 'select',
        placeholder: 'Seleccionar tipo',
        options: [
          { value: 'herraje', label: 'Herraje' },
          { value: 'desparasitacion', label: 'Desparasitación' },
          { value: 'vacunacion', label: 'Vacunación' },
          { value: 'limpieza', label: 'Limpieza' },
          { value: 'alimentacion', label: 'Alimentación' },
          { value: 'entrenamiento', label: 'Entrenamiento' },
          { value: 'veterinario', label: 'Veterinario' },
          { value: 'otros', label: 'Otros' }
        ]
      },
      {
        key: 'caballoId',
        label: 'Caballo',
        type: 'select',
        placeholder: 'Seleccionar caballo',
        options: [] // Se llenará dinámicamente
      },
      {
        key: 'costoMin',
        label: 'Costo mínimo',
        type: 'number',
        placeholder: '0',
        min: 0
      },
      {
        key: 'costoMax',
        label: 'Costo máximo',
        type: 'number',
        placeholder: 'Sin límite',
        min: 0
      },
      {
        key: 'fechaRealizacion',
        label: 'Fecha de realización',
        type: 'daterange'
      }
    ],
    showToggle: true,
    showSavePreset: true,
    showClearAll: true
  };

  filtrosValues: FilterValues = {};
  filtrosExpanded: boolean = false;

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.userRole = this.authService.getRole();
    this.canEdit = this.userRole === 'admin' || this.userRole === 'empleado';
    await this.cargarServicios();
    await this.cargarCaballos();
    this.actualizarOpcionesFiltroCaballo();
  }

  async cargarServicios() {
    try {
      this.isLoading = true;
      this.servicios = await this.firebaseService.getCollection('servicios');
      this.aplicarFiltros();
    } catch (error) {
      console.error('Error cargando servicios:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async cargarCaballos() {
    try {
      this.caballos = await this.firebaseService.getCollection('caballos');
    } catch (error) {
      console.error('Error cargando caballos:', error);
    }
  }

  actualizarOpcionesFiltroCaballo() {
    const caballoField = this.filtrosConfig.fields.find(f => f.key === 'caballoId');
    if (caballoField) {
      caballoField.options = [
        { value: null, label: 'Todos los caballos' },
        ...this.caballos.map(c => ({ value: c.id, label: c.nombre }))
      ];
    }
  }

  aplicarFiltros() {
    let filtrados = [...this.servicios];

    // Filtro de búsqueda general
    if (this.filtrosValues['busqueda']) {
      const busqueda = this.filtrosValues['busqueda'].toLowerCase();
      filtrados = filtrados.filter(servicio =>
        servicio.tipoServicio?.toLowerCase().includes(busqueda) ||
        servicio.descripcion?.toLowerCase().includes(busqueda) ||
        this.getNombreCaballo(servicio.caballoId)?.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por tipo de servicio
    if (this.filtrosValues['tipoServicio']) {
      filtrados = filtrados.filter(servicio => servicio.tipoServicio === this.filtrosValues['tipoServicio']);
    }

    // Filtro por caballo
    if (this.filtrosValues['caballoId']) {
      filtrados = filtrados.filter(servicio => servicio.caballoId === this.filtrosValues['caballoId']);
    }

    // Filtro por costo mínimo
    if (this.filtrosValues['costoMin']) {
      filtrados = filtrados.filter(servicio => servicio.costo >= this.filtrosValues['costoMin']);
    }

    // Filtro por costo máximo
    if (this.filtrosValues['costoMax']) {
      filtrados = filtrados.filter(servicio => servicio.costo <= this.filtrosValues['costoMax']);
    }

    // Filtro por fecha de realización
    if (this.filtrosValues['fechaRealizacion']) {
      const fechaFiltro = this.filtrosValues['fechaRealizacion'];
      if (fechaFiltro.start) {
        const fechaInicio = new Date(fechaFiltro.start);
        filtrados = filtrados.filter(servicio => {
          const fechaServicio = new Date(servicio.fechaRealizacion);
          return fechaServicio >= fechaInicio;
        });
      }
      if (fechaFiltro.end) {
        const fechaFin = new Date(fechaFiltro.end);
        filtrados = filtrados.filter(servicio => {
          const fechaServicio = new Date(servicio.fechaRealizacion);
          return fechaServicio <= fechaFin;
        });
      }
    }

    // Ordenar por fecha de realización (más reciente primero)
    filtrados.sort((a, b) => {
      const fechaA = new Date(a.fechaRealizacion);
      const fechaB = new Date(b.fechaRealizacion);
      return fechaB.getTime() - fechaA.getTime();
    });

    this.serviciosFiltrados = filtrados;
  }

  async agregarServicio() {
    if (!this.canEdit || !this.nuevoServicio.caballoId || !this.nuevoServicio.fechaRealizacion) {
      return;
    }

    try {
      this.isLoading = true;
      const servicioData = {
        ...this.nuevoServicio,
        fechaRealizacion: new Date(this.nuevoServicio.fechaRealizacion),
        proximaFecha: this.nuevoServicio.proximaFecha ? new Date(this.nuevoServicio.proximaFecha) : null,
        costo: this.nuevoServicio.costo * 100, // Convertir a centavos
        realizadoPor: this.authService.getCurrentUser()?.id
      };

      await this.firebaseService.createDocument('servicios', servicioData);
      await this.cargarServicios();
      this.resetForm();
      this.showForm = false;
    } catch (error) {
      console.error('Error creando servicio:', error);
      alert('Error al crear el servicio');
    } finally {
      this.isLoading = false;
    }
  }

  async eliminarServicio(servicioId: string) {
    if (!this.canEdit) return;

    if (confirm('¿Está seguro de eliminar este servicio?')) {
      try {
        this.isLoading = true;
        await this.firebaseService.deleteDocument('servicios', servicioId);
        await this.cargarServicios();
      } catch (error) {
        console.error('Error eliminando servicio:', error);
        alert('Error al eliminar el servicio');
      } finally {
        this.isLoading = false;
      }
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  private resetForm() {
    this.nuevoServicio = {
      caballoId: '',
      tipoServicio: 'herraje',
      descripcion: '',
      costo: 0,
      fechaRealizacion: '',
      proximaFecha: '',
      observaciones: ''
    };
  }

  getNombreCaballo(caballoId: string): string {
    const caballo = this.caballos.find(c => c.id === caballoId);
    return caballo ? caballo.nombre : 'Desconocido';
  }

  getTipoServicioLabel(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'herraje': 'Herraje',
      'desparasitacion': 'Desparasitación',
      'vacunacion': 'Vacunación',
      'limpieza': 'Limpieza',
      'alimentacion': 'Alimentación',
      'entrenamiento': 'Entrenamiento',
      'veterinario': 'Veterinario',
      'otros': 'Otros'
    };
    return tipos[tipo] || tipo;
  }

  getCostoTotal(): number {
    return this.serviciosFiltrados.reduce((sum, s) => sum + (s.costo || 0), 0) / 100;
  }

  getServiciosRecientes(): number {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    return this.serviciosFiltrados.filter(servicio => {
      const fechaServicio = new Date(servicio.fechaRealizacion);
      return fechaServicio >= hace30Dias;
    }).length;
  }

  onFiltrosChange(values: FilterValues) {
    this.filtrosValues = values;
    this.aplicarFiltros();
  }

  onFiltrosToggle(expanded: boolean | any) {
    this.filtrosExpanded = expanded === true || expanded === false ? expanded : false;
  }

  onFiltrosClear() {
    this.filtrosValues = {};
    this.aplicarFiltros();
  }

  onFiltrosApply(values: FilterValues) {
    this.filtrosValues = values;
    this.aplicarFiltros();
  }
}
