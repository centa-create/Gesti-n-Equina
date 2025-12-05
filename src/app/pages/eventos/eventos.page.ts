import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { AdvancedFiltersComponent, FilterConfig, FilterValues } from '../../components/advanced-filters/advanced-filters.component';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, AdvancedFiltersComponent],
  templateUrl: './eventos.page.html',
  styleUrls: ['./eventos.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventosPage implements OnInit {
  userRole: string | null = null;
  canEdit: boolean = false;
  eventos: any[] = [];
  eventosFiltrados: any[] = [];
  caballos: any[] = [];
  isLoading = false;
  showForm = false;

  nuevoEvento: any = {
    titulo: '',
    descripcion: '',
    tipo: 'cita_veterinaria',
    estado: 'pendiente',
    fechaInicio: '',
    fechaFin: '',
    ubicacion: '',
    notas: ''
  };

  // Configuración de filtros avanzados
  filtrosConfig: FilterConfig = {
    title: 'Eventos',
    fields: [
      {
        key: 'busqueda',
        label: 'Buscar',
        type: 'text',
        placeholder: 'Título, descripción, ubicación...'
      },
      {
        key: 'tipo',
        label: 'Tipo de evento',
        type: 'select',
        placeholder: 'Seleccionar tipo',
        options: [
          { value: 'cita_veterinaria', label: 'Cita Veterinaria' },
          { value: 'competicion', label: 'Competición' },
          { value: 'entrenamiento', label: 'Entrenamiento' },
          { value: 'reproduccion', label: 'Reproducción' },
          { value: 'mantenimiento', label: 'Mantenimiento' },
          { value: 'otros', label: 'Otros' }
        ]
      },
      {
        key: 'estado',
        label: 'Estado',
        type: 'select',
        placeholder: 'Seleccionar estado',
        options: [
          { value: 'pendiente', label: 'Pendiente' },
          { value: 'confirmado', label: 'Confirmado' },
          { value: 'completado', label: 'Completado' },
          { value: 'cancelado', label: 'Cancelado' }
        ]
      },
      {
        key: 'fechaInicio',
        label: 'Fecha de inicio',
        type: 'daterange'
      },
      {
        key: 'ubicacion',
        label: 'Ubicación',
        type: 'text',
        placeholder: 'Lugar del evento'
      }
    ],
    showToggle: true,
    showSavePreset: true,
    showClearAll: true
  };

  filtrosValues: FilterValues = {};
  filtrosExpanded: boolean = false;

  // Sistema de vistas múltiples
  vistaActual: 'lista' | 'calendario' | 'timeline' = 'lista';

  // Datos para vistas avanzadas
  eventosAgrupados: any[] = [];
  eventosOrdenados: any[] = [];
  diasCalendario: any[] = [];

  // Opciones para slides
  slideOpts = {
    slidesPerView: 1.2,
    spaceBetween: 10,
    centeredSlides: false
  };

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.userRole = this.authService.getRole();
    this.canEdit = this.userRole === 'admin';
    await this.cargarEventos();
    await this.cargarCaballos();
  }

  async cargarEventos() {
    try {
      this.isLoading = true;
      // Obtener eventos del usuario actual o todos si es admin
      const userId = this.authService.getCurrentUser()?.id;
      if (this.userRole === 'admin') {
        this.eventos = await this.firebaseService.getCollection('eventos');
      } else {
        this.eventos = await this.firebaseService.queryDocuments('eventos', [
          { field: 'usuarioId', operator: '==', value: userId }
        ]);
      }
      this.aplicarFiltros();
    } catch (error) {
      console.error('Error cargando eventos:', error);
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

  aplicarFiltros() {
    let filtrados = [...this.eventos];

    // Filtro de búsqueda general
    if (this.filtrosValues['busqueda']) {
      const busqueda = this.filtrosValues['busqueda'].toLowerCase();
      filtrados = filtrados.filter(evento =>
        evento.titulo?.toLowerCase().includes(busqueda) ||
        evento.descripcion?.toLowerCase().includes(busqueda) ||
        evento.ubicacion?.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por tipo
    if (this.filtrosValues['tipo']) {
      filtrados = filtrados.filter(evento => evento.tipo === this.filtrosValues['tipo']);
    }

    // Filtro por estado
    if (this.filtrosValues['estado']) {
      filtrados = filtrados.filter(evento => evento.estado === this.filtrosValues['estado']);
    }

    // Filtro por ubicación
    if (this.filtrosValues['ubicacion']) {
      const ubicacion = this.filtrosValues['ubicacion'].toLowerCase();
      filtrados = filtrados.filter(evento =>
        evento.ubicacion?.toLowerCase().includes(ubicacion)
      );
    }

    // Filtro por fecha de inicio
    if (this.filtrosValues['fechaInicio']) {
      const fechaFiltro = this.filtrosValues['fechaInicio'];
      if (fechaFiltro.start) {
        const fechaInicio = new Date(fechaFiltro.start);
        filtrados = filtrados.filter(evento => {
          const fechaEvento = evento.fechaInicio?.toDate ? evento.fechaInicio.toDate() : new Date(evento.fechaInicio);
          return fechaEvento >= fechaInicio;
        });
      }
      if (fechaFiltro.end) {
        const fechaFin = new Date(fechaFiltro.end);
        filtrados = filtrados.filter(evento => {
          const fechaEvento = evento.fechaInicio?.toDate ? evento.fechaInicio.toDate() : new Date(evento.fechaInicio);
          return fechaEvento <= fechaFin;
        });
      }
    }

    // Ordenar por fecha de inicio
    filtrados.sort((a, b) => {
      const fechaA = a.fechaInicio?.toDate ? a.fechaInicio.toDate() : new Date(a.fechaInicio);
      const fechaB = b.fechaInicio?.toDate ? b.fechaInicio.toDate() : new Date(b.fechaInicio);
      return fechaA.getTime() - fechaB.getTime();
    });

    this.eventosFiltrados = filtrados;
  }

  editarEvento(evento: any) {
    if (!this.canEdit) return;
    this.nuevoEvento = { ...evento };
    this.showForm = true;
  }

  async agregarEvento() {
    if (!this.canEdit || !this.nuevoEvento.titulo || !this.nuevoEvento.fechaInicio) {
      return;
    }

    try {
      this.isLoading = true;
      const eventoData = {
        ...this.nuevoEvento,
        usuarioId: this.authService.getCurrentUser()?.id,
        fechaInicio: new Date(this.nuevoEvento.fechaInicio),
        fechaFin: this.nuevoEvento.fechaFin ? new Date(this.nuevoEvento.fechaFin) : null
      };

      if (this.nuevoEvento.id) {
        // Update existing
        await this.firebaseService.updateDocument('eventos', this.nuevoEvento.id, eventoData);
      } else {
        // Create new
        await this.firebaseService.createDocument('eventos', eventoData);
      }
      await this.cargarEventos();
      this.resetForm();
      this.showForm = false;
    } catch (error) {
      console.error('Error guardando evento:', error);
      alert('Error al guardar el evento');
    } finally {
      this.isLoading = false;
    }
  }

  async eliminarEvento(eventoId: string) {
    if (!this.canEdit) return;

    if (confirm('¿Está seguro de eliminar este evento?')) {
      try {
        this.isLoading = true;
        await this.firebaseService.deleteDocument('eventos', eventoId);
        await this.cargarEventos();
      } catch (error) {
        console.error('Error eliminando evento:', error);
        alert('Error al eliminar el evento');
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
    this.nuevoEvento = {
      titulo: '',
      descripcion: '',
      tipo: 'cita_veterinaria',
      estado: 'pendiente',
      fechaInicio: '',
      fechaFin: '',
      ubicacion: '',
      notas: ''
    };
  }

  getNombreCaballo(caballoId: string): string {
    const caballo = this.caballos.find(c => c.id === caballoId);
    return caballo ? caballo.nombre : 'Desconocido';
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'confirmado': return 'primary';
      case 'completado': return 'success';
      case 'cancelado': return 'danger';
      default: return 'medium';
    }
  }

  getTipoLabel(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'cita_veterinaria': 'Cita Veterinaria',
      'competicion': 'Competición',
      'entrenamiento': 'Entrenamiento',
      'reproduccion': 'Reproducción',
      'mantenimiento': 'Mantenimiento',
      'otros': 'Otros'
    };
    return tipos[tipo] || tipo;
  }

  getEventosProximos(): number {
    const ahora = new Date();
    const semanaDespues = new Date();
    semanaDespues.setDate(ahora.getDate() + 7);

    return this.eventosFiltrados.filter(evento => {
      const fechaEvento = evento.fechaInicio?.toDate ? evento.fechaInicio.toDate() : new Date(evento.fechaInicio);
      return fechaEvento >= ahora && fechaEvento <= semanaDespues && evento.estado !== 'completado';
    }).length;
  }

  getEventosCompletados(): number {
    return this.eventosFiltrados.filter(e => e.estado === 'completado').length;
  }

  getFechaFormateada(fecha: any): string {
    if (!fecha) return 'Fecha no definida';
    const fechaObj = fecha?.toDate ? fecha.toDate() : new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // ====================
  // MÉTODOS PARA VISTAS AVANZADAS
  // ====================

  cambiarVista(vista: 'lista' | 'calendario' | 'timeline') {
    this.vistaActual = vista;
    if (vista === 'lista') {
      this.agruparEventosPorFecha();
    } else if (vista === 'calendario') {
      this.generarCalendario();
    } else if (vista === 'timeline') {
      this.ordenarEventosParaTimeline();
    }
  }

  // Vista de Lista Mejorada
  agruparEventosPorFecha() {
    const grupos: { [key: string]: any[] } = {};

    this.eventosFiltrados.forEach(evento => {
      const fecha = evento.fechaInicio?.toDate ? evento.fechaInicio.toDate() : new Date(evento.fechaInicio);
      const fechaKey = fecha.toISOString().split('T')[0];

      if (!grupos[fechaKey]) {
        grupos[fechaKey] = [];
      }
      grupos[fechaKey].push(evento);
    });

    this.eventosAgrupados = Object.keys(grupos)
      .sort()
      .map(fecha => ({
        fecha,
        eventos: grupos[fecha]
      }));
  }

  trackByFecha(index: number, item: any): string {
    return item.fecha;
  }

  // Vista de Calendario
  generarCalendario() {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anoActual = hoy.getFullYear();

    const primerDia = new Date(anoActual, mesActual, 1);
    const ultimoDia = new Date(anoActual, mesActual + 1, 0);
    const diasEnMes = ultimoDia.getDate();

    this.diasCalendario = [];

    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(anoActual, mesActual, dia);
      const fechaKey = fecha.toISOString().split('T')[0];

      const eventosDelDia = this.eventosFiltrados.filter(evento => {
        const fechaEvento = evento.fechaInicio?.toDate ? evento.fechaInicio.toDate() : new Date(evento.fechaInicio);
        return fechaEvento.toISOString().split('T')[0] === fechaKey;
      });

      this.diasCalendario.push({
        numero: dia,
        nombreCorto: fecha.toLocaleDateString('es-ES', { weekday: 'short' }),
        fecha: fecha,
        eventos: eventosDelDia,
        esHoy: fecha.toDateString() === hoy.toDateString()
      });
    }
  }

  seleccionarDia(dia: any) {
    // Aquí se podría implementar navegación a vista detallada del día
    console.log('Día seleccionado:', dia);
  }

  // Vista de Timeline
  ordenarEventosParaTimeline() {
    this.eventosOrdenados = [...this.eventosFiltrados].sort((a, b) => {
      const fechaA = a.fechaInicio?.toDate ? a.fechaInicio.toDate() : new Date(a.fechaInicio);
      const fechaB = b.fechaInicio?.toDate ? b.fechaInicio.toDate() : new Date(b.fechaInicio);
      return fechaA.getTime() - fechaB.getTime();
    });
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  // ====================
  // MÉTODOS DE UTILIDAD PARA VISTAS
  // ====================

  getEventosProximosLista(): any[] {
    const ahora = new Date();
    const semanaDespues = new Date();
    semanaDespues.setDate(ahora.getDate() + 7);

    return this.eventosFiltrados
      .filter(evento => {
        const fechaEvento = evento.fechaInicio?.toDate ? evento.fechaInicio.toDate() : new Date(evento.fechaInicio);
        return fechaEvento >= ahora && fechaEvento <= semanaDespues && evento.estado !== 'completado';
      })
      .slice(0, 5); // Máximo 5 eventos destacados
  }

  getDiasRestantes(fecha: any): number {
    const fechaEvento = fecha?.toDate ? fecha.toDate() : new Date(fecha);
    const ahora = new Date();
    const diferencia = fechaEvento.getTime() - ahora.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }

  getEventosHoy(): number {
    const hoy = new Date();
    const hoyKey = hoy.toISOString().split('T')[0];

    return this.eventosFiltrados.filter(evento => {
      const fechaEvento = evento.fechaInicio?.toDate ? evento.fechaInicio.toDate() : new Date(evento.fechaInicio);
      return fechaEvento.toISOString().split('T')[0] === hoyKey;
    }).length;
  }

  // Mapeos de colores e iconos
  getTipoClase(tipo: string): string {
    const clases: { [key: string]: string } = {
      'cita_veterinaria': 'tipo-veterinaria',
      'competicion': 'tipo-competicion',
      'entrenamiento': 'tipo-entrenamiento',
      'reproduccion': 'tipo-reproduccion',
      'mantenimiento': 'tipo-mantenimiento',
      'otros': 'tipo-otros'
    };
    return clases[tipo] || 'tipo-otros';
  }

  getTipoIcono(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'cita_veterinaria': 'medkit',
      'competicion': 'trophy',
      'entrenamiento': 'fitness',
      'reproduccion': 'heart',
      'mantenimiento': 'build',
      'otros': 'calendar'
    };
    return iconos[tipo] || 'calendar';
  }

  getEstadoClase(estado: string): string {
    const clases: { [key: string]: string } = {
      'pendiente': 'estado-pendiente',
      'confirmado': 'estado-confirmado',
      'completado': 'estado-completado',
      'cancelado': 'estado-cancelado'
    };
    return clases[estado] || 'estado-pendiente';
  }

  // Métodos de formato mejorados
  getHoraFormateada(fecha: any): string {
    if (!fecha) return '';
    const fechaObj = fecha?.toDate ? fecha.toDate() : new Date(fecha);
    return fechaObj.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFechaCompleta(fecha: any): string {
    if (!fecha) return 'Fecha no definida';
    const fechaObj = fecha?.toDate ? fecha.toDate() : new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Modal de detalle de evento
  async verDetalleEvento(evento: any) {
    // Aquí se implementaría un modal con detalles completos del evento
    console.log('Ver detalle del evento:', evento);
    // Por ahora, solo mostramos una alerta simple
    alert(`Evento: ${evento.titulo}\nTipo: ${this.getTipoLabel(evento.tipo)}\nFecha: ${this.getFechaCompleta(evento.fechaInicio)}\nEstado: ${evento.estado}`);
  }

  ngAfterViewInit() {
    // Inicializar vista por defecto
    setTimeout(() => {
      this.agruparEventosPorFecha();
    }, 100);
  }
}