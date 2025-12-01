import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { AdvancedFiltersComponent, FilterConfig, FilterValues } from '../../components/advanced-filters/advanced-filters.component';

@Component({
  selector: 'app-caballos',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, AdvancedFiltersComponent],
  templateUrl: './caballos.page.html',
  styleUrls: ['./caballos.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CaballosPage implements OnInit {
  userRole: string | null = null;
  canEdit: boolean = false;
  caballos: any[] = [];
  caballosFiltrados: any[] = [];
  criaderos: any[] = [];
  criaderoSeleccionado: string = '';
  nuevoCaballo: any = {
    nombre: '',
    nombreCriadero: '',
    fechaNacimiento: '',
    sexo: '',
    raza: '',
    pelaje: '',
    padreId: '',
    madreId: '',
    propietarioActualId: '',
    estado: 'activo',
    observaciones: ''
  };
  showForm: boolean = false;

  // Configuración de filtros avanzados
  filtrosConfig: FilterConfig = {
    title: 'Caballos',
    fields: [
      {
        key: 'busqueda',
        label: 'Buscar',
        type: 'text',
        placeholder: 'Nombre, raza, pelaje...'
      },
      {
        key: 'criaderoId',
        label: 'Criadero',
        type: 'select',
        placeholder: 'Seleccionar criadero',
        options: [] // Se llenará dinámicamente
      },
      {
        key: 'sexo',
        label: 'Sexo',
        type: 'select',
        placeholder: 'Seleccionar sexo',
        options: [
          { value: 'macho', label: 'Macho' },
          { value: 'hembra', label: 'Hembra' }
        ]
      },
      {
        key: 'estado',
        label: 'Estado',
        type: 'select',
        placeholder: 'Seleccionar estado',
        options: [
          { value: 'activo', label: 'Activo' },
          { value: 'inactivo', label: 'Inactivo' },
          { value: 'fallecido', label: 'Fallecido' },
          { value: 'vendido', label: 'Vendido' }
        ]
      },
      {
        key: 'raza',
        label: 'Raza',
        type: 'text',
        placeholder: 'Ej: Pura Sangre Inglés'
      },
      {
        key: 'edadMin',
        label: 'Edad mínima (años)',
        type: 'number',
        placeholder: '0',
        min: 0,
        max: 30
      },
      {
        key: 'edadMax',
        label: 'Edad máxima (años)',
        type: 'number',
        placeholder: 'Sin límite',
        min: 0,
        max: 30
      },
      {
        key: 'fechaNacimiento',
        label: 'Fecha de nacimiento',
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
    this.canEdit = this.userRole === 'admin';
    await this.cargarCriaderos();
    await this.cargarCaballos();
    this.actualizarOpcionesFiltroCriadero();
  }

  async cargarCriaderos() {
    try {
      this.criaderos = await this.firebaseService.getCriaderos();
    } catch (error) {
      console.error('Error cargando criaderos:', error);
    }
  }

  async cargarCaballos(criaderoId?: string) {
    try {
      this.caballos = await this.firebaseService.getCaballos(criaderoId);
      this.aplicarFiltros();
    } catch (error) {
      console.error('Error cargando caballos:', error);
    }
  }

  actualizarOpcionesFiltroCriadero() {
    const criaderoField = this.filtrosConfig.fields.find(f => f.key === 'criaderoId');
    if (criaderoField) {
      criaderoField.options = [
        { value: null, label: 'Todos los criaderos' },
        ...this.criaderos.map(c => ({ value: c.id, label: c.nombre }))
      ];
    }
  }

  aplicarFiltros() {
    let filtrados = [...this.caballos];

    // Filtro de búsqueda general
    if (this.filtrosValues['busqueda']) {
      const busqueda = this.filtrosValues['busqueda'].toLowerCase();
      filtrados = filtrados.filter(caballo =>
        caballo.nombre?.toLowerCase().includes(busqueda) ||
        caballo.raza?.toLowerCase().includes(busqueda) ||
        caballo.pelaje?.toLowerCase().includes(busqueda) ||
        caballo.nombreCriadero?.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por criadero
    if (this.filtrosValues['criaderoId']) {
      filtrados = filtrados.filter(caballo => caballo.criaderoId === this.filtrosValues['criaderoId']);
    }

    // Filtro por sexo
    if (this.filtrosValues['sexo']) {
      filtrados = filtrados.filter(caballo => caballo.sexo === this.filtrosValues['sexo']);
    }

    // Filtro por estado
    if (this.filtrosValues['estado']) {
      filtrados = filtrados.filter(caballo => caballo.estado === this.filtrosValues['estado']);
    }

    // Filtro por raza
    if (this.filtrosValues['raza']) {
      const raza = this.filtrosValues['raza'].toLowerCase();
      filtrados = filtrados.filter(caballo =>
        caballo.raza?.toLowerCase().includes(raza)
      );
    }

    // Filtro por edad mínima
    if (this.filtrosValues['edadMin']) {
      filtrados = filtrados.filter(caballo => {
        const edad = this.calcularEdad(caballo.fechaNacimiento);
        return edad >= this.filtrosValues['edadMin'];
      });
    }

    // Filtro por edad máxima
    if (this.filtrosValues['edadMax']) {
      filtrados = filtrados.filter(caballo => {
        const edad = this.calcularEdad(caballo.fechaNacimiento);
        return edad <= this.filtrosValues['edadMax'];
      });
    }

    // Filtro por fecha de nacimiento
    if (this.filtrosValues['fechaNacimiento']) {
      const fechaFiltro = this.filtrosValues['fechaNacimiento'];
      if (fechaFiltro.start) {
        const fechaInicio = new Date(fechaFiltro.start);
        filtrados = filtrados.filter(caballo => {
          const fechaCaballo = new Date(caballo.fechaNacimiento);
          return fechaCaballo >= fechaInicio;
        });
      }
      if (fechaFiltro.end) {
        const fechaFin = new Date(fechaFiltro.end);
        filtrados = filtrados.filter(caballo => {
          const fechaCaballo = new Date(caballo.fechaNacimiento);
          return fechaCaballo <= fechaFin;
        });
      }
    }

    this.caballosFiltrados = filtrados;
  }

  calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    return hoy.getFullYear() - nacimiento.getFullYear();
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

  onCriaderoChange() {
    this.cargarCaballos(this.criaderoSeleccionado || undefined);
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  editarCaballo(caballo: any) {
    if (!this.canEdit) return;

    this.nuevoCaballo = { ...caballo };
    this.showForm = true;
  }

  async agregarCaballo() {
    if (!this.canEdit) return;

    if (!this.nuevoCaballo.nombre || !this.nuevoCaballo.sexo) {
      alert('Nombre y sexo son obligatorios');
      return;
    }

    try {
      const caballoData = {
        ...this.nuevoCaballo,
        criaderoId: this.criaderoSeleccionado || this.criaderos[0]?.id,
        fechaNacimiento: this.nuevoCaballo.fechaNacimiento ?
          new Date(this.nuevoCaballo.fechaNacimiento) : null
      };

      if (this.nuevoCaballo.id) {
        // Update existing
        await this.firebaseService.updateDocument('caballos', this.nuevoCaballo.id, caballoData);
      } else {
        // Create new
        await this.firebaseService.createDocument('caballos', caballoData);
      }
      await this.cargarCaballos();
      this.resetForm();
      this.showForm = false;
    } catch (error) {
      console.error('Error guardando caballo:', error);
      alert('Error al guardar el caballo');
    }
  }

  async eliminarCaballo(caballoId: string) {
    if (!this.canEdit) return;

    if (confirm('¿Estás seguro de eliminar este caballo?')) {
      try {
        await this.firebaseService.deleteDocument('caballos', caballoId);
        await this.cargarCaballos();
      } catch (error) {
        console.error('Error eliminando caballo:', error);
        alert('Error al eliminar el caballo');
      }
    }
  }

  private resetForm() {
    this.nuevoCaballo = {
      nombre: '',
      nombreCriadero: '',
      fechaNacimiento: '',
      sexo: '',
      raza: '',
      pelaje: '',
      padreId: '',
      madreId: '',
      propietarioActualId: '',
      estado: 'activo',
      observaciones: ''
    };
  }

  getPadre(caballo: any) {
    return this.caballos.find(c => c.id === caballo.padreId);
  }

  getMadre(caballo: any) {
    return this.caballos.find(c => c.id === caballo.madreId);
  }

  getEdad(fechaNacimiento: string) {
    if (!fechaNacimiento) return 'Desconocida';
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    return `${edad} años`;
  }

  getEstadisticasGenero() {
    const machos = this.caballosFiltrados.filter(c => c.sexo === 'macho').length;
    const hembras = this.caballosFiltrados.filter(c => c.sexo === 'hembra').length;
    return { machos, hembras };
  }

  getEdadPromedio(): number {
    if (this.caballosFiltrados.length === 0) return 0;

    const edades = this.caballosFiltrados
      .map(c => this.calcularEdad(c.fechaNacimiento))
      .filter(edad => edad > 0);

    if (edades.length === 0) return 0;

    const suma = edades.reduce((sum, edad) => sum + edad, 0);
    return Math.round(suma / edades.length);
  }
}