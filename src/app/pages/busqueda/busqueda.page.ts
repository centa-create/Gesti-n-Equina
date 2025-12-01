import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { SearchFilterComponent, SearchFilter, SearchFilterConfig } from '../../components/search-filter/search-filter.component';

interface SearchResult {
  id: string;
  type: 'produccion' | 'caballo' | 'cliente' | 'servicio' | 'finanza' | 'evento';
  title: string;
  subtitle: string;
  description: string;
  date?: string;
  category?: string;
  status?: string;
  moduleIcon: string;
  moduleColor: string;
}

@Component({
  selector: 'app-busqueda',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, SearchFilterComponent],
  templateUrl: './busqueda.page.html',
  styleUrls: ['./busqueda.page.scss']
})
export class BusquedaPage implements OnInit {

  searchConfig: SearchFilterConfig = {
    showSearchText: true,
    showDateRange: true,
    showCategory: true,
    showStatus: false,
    showSort: true,
    categories: [
      { value: 'produccion', label: 'Producción' },
      { value: 'caballos', label: 'Caballos' },
      { value: 'clientes', label: 'Clientes' },
      { value: 'servicios', label: 'Servicios' },
      { value: 'finanzas', label: 'Finanzas' },
      { value: 'eventos', label: 'Eventos' },
      { value: 'todos', label: 'Todos los módulos' }
    ],
    statuses: [],
    sortOptions: [
      { value: 'fecha', label: 'Fecha' },
      { value: 'tipo', label: 'Tipo' },
      { value: 'titulo', label: 'Título' }
    ],
    placeholder: 'Buscar en todos los módulos...',
    title: 'Búsqueda Global Avanzada'
  };

  currentFilters: SearchFilter = {
    searchText: '',
    dateFrom: '',
    dateTo: '',
    category: 'todos',
    status: '',
    sortBy: 'fecha',
    sortOrder: 'desc'
  };

  searchResults: SearchResult[] = [];
  isLoading = false;
  hasSearched = false;

  // Estadísticas de búsqueda
  searchStats = {
    totalResults: 0,
    produccion: 0,
    caballos: 0,
    clientes: 0,
    servicios: 0,
    finanzas: 0,
    eventos: 0
  };

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) { }

  ngOnInit() {
    // Iniciar con búsqueda vacía para mostrar todos los resultados disponibles
    this.performSearch();
  }

  // Método para forzar una nueva búsqueda
  refreshSearch() {
    this.performSearch();
  }

  onFiltersChanged(filters: SearchFilter) {
    this.currentFilters = filters;
    if (this.hasSearched) {
      this.performSearch();
    }
  }

  onSearchTriggered(filters: SearchFilter) {
    this.currentFilters = filters;
    this.performSearch();
  }

  async performSearch() {
    this.isLoading = true;
    this.hasSearched = true;

    try {
      const results: SearchResult[] = [];
      console.log('Iniciando búsqueda con filtros:', this.currentFilters);

      // Buscar en producción
      if (this.shouldSearchModule('produccion')) {
        const produccionResults = await this.searchProduccion();
        console.log('Resultados producción:', produccionResults.length);
        results.push(...produccionResults);
      }

      // Buscar en caballos
      if (this.shouldSearchModule('caballos')) {
        const caballosResults = await this.searchCaballos();
        console.log('Resultados caballos:', caballosResults.length);
        results.push(...caballosResults);
      }

      // Buscar en clientes
      if (this.shouldSearchModule('clientes')) {
        const clientesResults = await this.searchClientes();
        console.log('Resultados clientes:', clientesResults.length);
        results.push(...clientesResults);
      }

      // Buscar en servicios
      if (this.shouldSearchModule('servicios')) {
        const serviciosResults = await this.searchServicios();
        console.log('Resultados servicios:', serviciosResults.length);
        results.push(...serviciosResults);
      }

      // Buscar en finanzas
      if (this.shouldSearchModule('finanzas')) {
        const finanzasResults = await this.searchFinanzas();
        console.log('Resultados finanzas:', finanzasResults.length);
        results.push(...finanzasResults);
      }

      // Buscar en eventos
      if (this.shouldSearchModule('eventos')) {
        const eventosResults = await this.searchEventos();
        console.log('Resultados eventos:', eventosResults.length);
        results.push(...eventosResults);
      }

      console.log('Total resultados antes de filtros:', results.length);

      // Aplicar filtros de fecha y ordenamiento
      let filteredResults = this.applyDateFilters(results);
      filteredResults = this.applySorting(filteredResults);

      console.log('Texto de búsqueda:', this.currentFilters.searchText);
      console.log('Total resultados antes de filtros de texto:', results.length);
      console.log('Total resultados finales:', filteredResults.length);

      // Si no hay resultados y no hay texto de búsqueda, verificar si las colecciones están vacías
      if (filteredResults.length === 0 && !this.currentFilters.searchText?.trim()) {
        console.warn('No se encontraron datos en ninguna colección. Verifica que tengas datos en Firebase.');
      }

      this.searchResults = filteredResults;
      this.updateSearchStats();

    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private shouldSearchModule(module: string): boolean {
    return this.currentFilters.category === 'todos' || this.currentFilters.category === module;
  }

  private async searchProduccion(): Promise<SearchResult[]> {
    try {
      const produccion = await this.firebaseService.getCollection('produccion');
      return produccion
        .filter(item => this.matchesSearchText(item))
        .map(item => ({
          id: item.id,
          type: 'produccion' as const,
          title: `${item.tipo} - ${item.cantidad} ${item.unidad}`,
          subtitle: `Producción del ${this.formatDate(item.fecha)}`,
          description: `Costo: ${item.costo || 0} | Ingreso: ${item.ingreso || 0}`,
          date: item.fecha,
          category: item.tipo,
          moduleIcon: 'leaf',
          moduleColor: 'success'
        }));
    } catch (error) {
      console.error('Error buscando producción:', error);
      return [];
    }
  }

  private async searchCaballos(): Promise<SearchResult[]> {
    try {
      const caballos = await this.firebaseService.getCaballos();
      console.log('Caballos encontrados:', caballos.length);
      return caballos
        .filter(caballo => this.matchesSearchText(caballo))
        .map(caballo => ({
          id: caballo.id,
          type: 'caballo' as const,
          title: caballo.nombre,
          subtitle: `${caballo.raza} - ${caballo.sexo}`,
          description: `Propietario: ${caballo.propietarioActualId || 'Sin asignar'}`,
          date: caballo.createdAt?.toDate?.()?.toISOString() || caballo.fechaNacimiento,
          category: caballo.raza,
          status: caballo.estado,
          moduleIcon: 'paw',
          moduleColor: 'tertiary'
        }));
    } catch (error) {
      console.error('Error buscando caballos:', error);
      return [];
    }
  }

  private async searchClientes(): Promise<SearchResult[]> {
    try {
      const clientes = await this.firebaseService.getCollection('clientes');
      return clientes
        .filter(cliente => this.matchesSearchText(cliente))
        .map(cliente => ({
          id: cliente.id,
          type: 'cliente' as const,
          title: `${cliente.nombre} ${cliente.apellido || ''}`,
          subtitle: cliente.tipo || 'Cliente',
          description: `${cliente.ciudad || ''} - ${cliente.telefono || ''}`,
          date: cliente.createdAt?.toDate?.()?.toISOString(),
          category: cliente.tipo,
          status: cliente.activo ? 'activo' : 'inactivo',
          moduleIcon: 'person',
          moduleColor: 'secondary'
        }));
    } catch (error) {
      console.error('Error buscando clientes:', error);
      return [];
    }
  }

  private async searchServicios(): Promise<SearchResult[]> {
    try {
      const servicios = await this.firebaseService.getCollection('servicios');
      return servicios
        .filter(servicio => this.matchesSearchText(servicio))
        .map(servicio => ({
          id: servicio.id,
          type: 'servicio' as const,
          title: servicio.tipoServicio,
          subtitle: `Servicio del ${this.formatDate(servicio.fechaRealizacion)}`,
          description: `Costo: ${servicio.costo || 0} - ${servicio.descripcion || ''}`,
          date: servicio.fechaRealizacion,
          category: servicio.tipoServicio,
          moduleIcon: 'medical',
          moduleColor: 'danger'
        }));
    } catch (error) {
      console.error('Error buscando servicios:', error);
      return [];
    }
  }

  private async searchFinanzas(): Promise<SearchResult[]> {
    try {
      const finanzas = await this.firebaseService.getTransacciones();
      return finanzas
        .filter(transaccion => this.matchesSearchText(transaccion))
        .map(transaccion => ({
          id: transaccion.id,
          type: 'finanza' as const,
          title: transaccion.descripcion,
          subtitle: `${transaccion.tipo} - ${transaccion.categoria}`,
          description: `Monto: ${transaccion.monto / 100} COP`,
          date: transaccion.fecha,
          category: transaccion.categoria,
          moduleIcon: 'cash',
          moduleColor: 'warning'
        }));
    } catch (error) {
      console.error('Error buscando finanzas:', error);
      return [];
    }
  }

  private async searchEventos(): Promise<SearchResult[]> {
    try {
      const eventos = await this.firebaseService.getCollection('eventos');
      return eventos
        .filter(evento => this.matchesSearchText(evento))
        .map(evento => ({
          id: evento.id,
          type: 'evento' as const,
          title: evento.titulo,
          subtitle: evento.tipo || 'Evento',
          description: evento.descripcion || '',
          date: evento.fechaInicio,
          category: evento.tipo,
          status: evento.estado,
          moduleIcon: 'calendar',
          moduleColor: 'primary'
        }));
    } catch (error) {
      console.error('Error buscando eventos:', error);
      return [];
    }
  }

  private matchesSearchText(item: any): boolean {
    if (!this.currentFilters.searchText) return true;

    const searchText = this.currentFilters.searchText.toLowerCase().trim();
    if (!searchText) return true;

    const searchableFields = [
      item.nombre, item.titulo, item.descripcion, item.tipo,
      item.raza, item.categoria, item.tipoServicio,
      item.nombreCriadero, item.pelaje, item.especialidad,
      item.direccion, item.email, item.telefono
    ].filter(field => field && typeof field === 'string');

    return searchableFields.some(field =>
      field.toLowerCase().includes(searchText)
    );
  }

  private applyDateFilters(results: SearchResult[]): SearchResult[] {
    if (!this.currentFilters.dateFrom && !this.currentFilters.dateTo) {
      return results;
    }

    return results.filter(result => {
      if (!result.date) return true;

      const resultDate = new Date(result.date);
      const dateFrom = this.currentFilters.dateFrom ? new Date(this.currentFilters.dateFrom) : null;
      const dateTo = this.currentFilters.dateTo ? new Date(this.currentFilters.dateTo) : null;

      if (dateFrom && resultDate < dateFrom) return false;
      if (dateTo && resultDate > dateTo) return false;

      return true;
    });
  }

  private applySorting(results: SearchResult[]): SearchResult[] {
    return results.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (this.currentFilters.sortBy) {
        case 'fecha':
          aValue = a.date ? new Date(a.date).getTime() : 0;
          bValue = b.date ? new Date(b.date).getTime() : 0;
          break;
        case 'tipo':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'titulo':
          aValue = a.title;
          bValue = b.title;
          break;
        default:
          return 0;
      }

      if (this.currentFilters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  private updateSearchStats() {
    this.searchStats = {
      totalResults: this.searchResults.length,
      produccion: this.searchResults.filter(r => r.type === 'produccion').length,
      caballos: this.searchResults.filter(r => r.type === 'caballo').length,
      clientes: this.searchResults.filter(r => r.type === 'cliente').length,
      servicios: this.searchResults.filter(r => r.type === 'servicio').length,
      finanzas: this.searchResults.filter(r => r.type === 'finanza').length,
      eventos: this.searchResults.filter(r => r.type === 'evento').length
    };
  }

  private formatDate(date: any): string {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('es-CO');
    } catch {
      return date.toString();
    }
  }

  navigateToResult(result: SearchResult) {
    const routes = {
      produccion: '/produccion',
      caballo: '/caballos',
      cliente: '/clientes',
      servicio: '/servicios',
      finanza: '/finanzas',
      evento: '/eventos'
    };

    this.router.navigate([routes[result.type]], {
      queryParams: { id: result.id }
    });
  }

  getResultIcon(result: SearchResult): string {
    return result.moduleIcon;
  }

  getResultColor(result: SearchResult): string {
    return result.moduleColor;
  }

  trackByResult(index: number, result: SearchResult): string {
    return result.id;
  }
}