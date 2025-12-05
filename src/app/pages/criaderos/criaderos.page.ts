import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';
import { AdvancedFiltersComponent, FilterConfig, FilterValues } from '../../components/advanced-filters/advanced-filters.component';

@Component({
  selector: 'app-criaderos',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, AdvancedFiltersComponent],
  templateUrl: './criaderos.page.html',
  styleUrls: ['./criaderos.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CriaderosPage implements OnInit {
  userRole: string | null = null;
  canEdit: boolean = false;
  criaderos: any[] = [];
  criaderosFiltrados: any[] = [];
  nuevoCriadero: any = {
    nombre: '',
    descripcion: '',
    direccion: '',
    telefono: '',
    email: '',
    capacidadMaxima: 0,
    activo: true
  };
  showForm: boolean = false;

  // Configuración de filtros avanzados
  filtrosConfig: FilterConfig = {
    title: 'Criaderos',
    fields: [
      {
        key: 'busqueda',
        label: 'Buscar',
        type: 'text',
        placeholder: 'Nombre, descripción, dirección...'
      },
      {
        key: 'activo',
        label: 'Estado',
        type: 'boolean',
        options: [
          { value: true, label: 'Activos' },
          { value: false, label: 'Inactivos' }
        ]
      },
      {
        key: 'capacidadMin',
        label: 'Capacidad mínima',
        type: 'number',
        placeholder: '0',
        min: 0
      },
      {
        key: 'capacidadMax',
        label: 'Capacidad máxima',
        type: 'number',
        placeholder: 'Sin límite',
        min: 0
      },
      {
        key: 'fechaCreacion',
        label: 'Fecha de creación',
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
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    // Suscribirse a cambios en el usuario para actualizar permisos
    this.authService.currentUser$.subscribe(user => {
      this.userRole = user?.role || null;
      this.canEdit = this.userRole === 'admin';
      console.log('Usuario actual:', user);
      console.log('Rol del usuario:', this.userRole);
      console.log('Puede editar:', this.canEdit);
      this.cdr.detectChanges();
    });

    await this.cargarCriaderos();
  }

  async cargarCriaderos() {
    try {
      this.criaderos = await this.firebaseService.getCriaderos();
      this.aplicarFiltros();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error cargando criaderos:', error);
    }
  }

  aplicarFiltros() {
    let filtrados = [...this.criaderos];

    // Filtro de búsqueda general
    if (this.filtrosValues['busqueda']) {
      const busqueda = this.filtrosValues['busqueda'].toLowerCase();
      filtrados = filtrados.filter(criadero =>
        criadero.nombre?.toLowerCase().includes(busqueda) ||
        criadero.descripcion?.toLowerCase().includes(busqueda) ||
        criadero.direccion?.toLowerCase().includes(busqueda) ||
        criadero.email?.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por estado activo
    if (this.filtrosValues['activo'] !== undefined && this.filtrosValues['activo'] !== null) {
      filtrados = filtrados.filter(criadero => criadero.activo === this.filtrosValues['activo']);
    }

    // Filtro por capacidad mínima
    if (this.filtrosValues['capacidadMin']) {
      filtrados = filtrados.filter(criadero =>
        criadero.capacidadMaxima >= this.filtrosValues['capacidadMin']
      );
    }

    // Filtro por capacidad máxima
    if (this.filtrosValues['capacidadMax']) {
      filtrados = filtrados.filter(criadero =>
        criadero.capacidadMaxima <= this.filtrosValues['capacidadMax']
      );
    }

    // Filtro por fecha de creación
    if (this.filtrosValues['fechaCreacion']) {
      const fechaFiltro = this.filtrosValues['fechaCreacion'];
      if (fechaFiltro.start) {
        const fechaInicio = new Date(fechaFiltro.start);
        filtrados = filtrados.filter(criadero => {
          const fechaCriadero = criadero.createdAt?.toDate ? criadero.createdAt.toDate() : new Date(criadero.createdAt);
          return fechaCriadero >= fechaInicio;
        });
      }
      if (fechaFiltro.end) {
        const fechaFin = new Date(fechaFiltro.end);
        filtrados = filtrados.filter(criadero => {
          const fechaCriadero = criadero.createdAt?.toDate ? criadero.createdAt.toDate() : new Date(criadero.createdAt);
          return fechaCriadero <= fechaFin;
        });
      }
    }

    this.criaderosFiltrados = filtrados;
  }

  onFiltrosChange(values: FilterValues) {
    this.filtrosValues = values;
    this.aplicarFiltros();
    this.cdr.detectChanges();
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

  seleccionarCriadero(criadero: any) {
    // Guardar criadero seleccionado en localStorage para otras páginas
    localStorage.setItem('criaderoActivo', JSON.stringify(criadero));
    this.router.navigate(['/home']);
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  editarCriadero(criadero: any) {
    if (!this.canEdit) return;
    this.nuevoCriadero = { ...criadero };
    this.showForm = true;
  }

  async agregarCriadero() {
    if (!this.canEdit) return;

    if (!this.nuevoCriadero.nombre) {
      alert('El nombre es obligatorio');
      return;
    }

    try {
      const criaderoData = {
        ...this.nuevoCriadero,
        createdBy: this.authService.getCurrentUser()?.id
      };

      if (this.nuevoCriadero.id) {
        // Update existing
        await this.firebaseService.updateDocument('criaderos', this.nuevoCriadero.id, criaderoData);
      } else {
        // Create new
        await this.firebaseService.createDocument('criaderos', criaderoData);
      }
      await this.cargarCriaderos();
      this.resetForm();
      this.showForm = false;
    } catch (error) {
      console.error('Error guardando criadero:', error);
      alert('Error al guardar el criadero');
    }
  }

  async eliminarCriadero(criaderoId: string) {
    if (!this.canEdit) return;

    if (confirm('¿Estás seguro de eliminar este criadero? Esto puede afectar a los caballos asociados.')) {
      try {
        await this.firebaseService.updateDocument('criaderos', criaderoId, { activo: false });
        await this.cargarCriaderos();
      } catch (error) {
        console.error('Error eliminando criadero:', error);
        alert('Error al eliminar el criadero');
      }
    }
  }

  private resetForm() {
    this.nuevoCriadero = {
      nombre: '',
      descripcion: '',
      direccion: '',
      telefono: '',
      email: '',
      capacidadMaxima: 0,
      activo: true
    };
  }

  getTotalCapacidad(): number {
    return this.criaderosFiltrados.reduce((sum, c) => sum + (c.capacidadMaxima || 0), 0);
  }
}