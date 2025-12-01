import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { FirebaseService } from '../../services/firebase.service';
import { SearchFilterComponent, SearchFilter, SearchFilterConfig } from '../../components/search-filter/search-filter.component';
import { Timestamp } from 'firebase/firestore';

interface ProduccionData {
  id?: string;
  fechaProduccion: string;
  tipoProducto: string;
  cantidad: number;
  unidad: string;
  costoOperativo: number;
  ingresosGenerados: number;
  observaciones?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

@Component({
  selector: 'app-produccion',
  templateUrl: './produccion.page.html',
  styleUrls: ['./produccion.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, SearchFilterComponent]
})
export class ProduccionPage implements OnInit {
  produccionForm: FormGroup;
  producciones: ProduccionData[] = [];
  produccionesFiltradas: ProduccionData[] = [];
  isLoading = false;
  isEditing = false;
  editingId: string | null = null;

  // Componente de búsqueda y filtros
  searchConfig: SearchFilterConfig = {
    showSearchText: true,
    showDateRange: true,
    showCategory: true,
    showStatus: false,
    showSort: true,
    categories: [
      { value: 'Café', label: 'Café' },
      { value: 'Cacao', label: 'Cacao' },
      { value: 'Palma de aceite', label: 'Palma de aceite' },
      { value: 'Maíz', label: 'Maíz' },
      { value: 'Arroz', label: 'Arroz' },
      { value: 'Caña de azúcar', label: 'Caña de azúcar' },
      { value: 'Frutas', label: 'Frutas' },
      { value: 'Verduras', label: 'Verduras' },
      { value: 'Ganadería', label: 'Ganadería' },
      { value: 'Otro', label: 'Otro' }
    ],
    statuses: [],
    sortOptions: [
      { value: 'fecha', label: 'Fecha' },
      { value: 'tipo', label: 'Tipo de producto' },
      { value: 'cantidad', label: 'Cantidad' },
      { value: 'ingresos', label: 'Ingresos' }
    ],
    placeholder: 'Buscar producciones...',
    title: 'Filtros de Producción'
  };

  currentFilters: SearchFilter = {
    searchText: '',
    dateFrom: '',
    dateTo: '',
    category: '',
    status: '',
    sortBy: 'fecha',
    sortOrder: 'desc'
  };

  tiposProducto = [
    'Café',
    'Cacao',
    'Palma de aceite',
    'Maíz',
    'Arroz',
    'Caña de azúcar',
    'Frutas',
    'Verduras',
    'Ganadería',
    'Otro'
  ];

  unidades = [
    'kg',
    'litros',
    'toneladas',
    'unidades',
    'hectáreas'
  ];

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.produccionForm = this.fb.group({
      fechaProduccion: ['', Validators.required],
      tipoProducto: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(0)]],
      unidad: ['kg', Validators.required],
      costoOperativo: ['', [Validators.required, Validators.min(0)]],
      ingresosGenerados: ['', [Validators.required, Validators.min(0)]],
      observaciones: ['']
    });

    // No necesitamos filtrosForm ya que usamos el componente SearchFilterComponent
  }

  ngOnInit() {
    this.loadProducciones();
  }

  async loadProducciones() {
    this.isLoading = true;
    try {
      // Por ahora usamos la colección 'produccion' - puedes cambiar esto según tu esquema
      this.producciones = await this.firebaseService.getCollection('produccion') || [];
      this.aplicarFiltros();
    } catch (error) {
      console.error('Error loading producciones:', error);
      this.showToast('Error al cargar las producciones', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  onFiltersChanged(filters: SearchFilter) {
    this.currentFilters = filters;
    this.aplicarFiltros();
  }

  onSearchTriggered(filters: SearchFilter) {
    this.currentFilters = filters;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let filtradas = [...this.producciones];

    // Filtro por texto de búsqueda
    if (this.currentFilters.searchText) {
      const busqueda = this.currentFilters.searchText.toLowerCase();
      filtradas = filtradas.filter(p =>
        p.tipoProducto.toLowerCase().includes(busqueda) ||
        p.observaciones?.toLowerCase().includes(busqueda) ||
        p.fechaProduccion.includes(busqueda) ||
        p.unidad.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por fecha de inicio
    if (this.currentFilters.dateFrom) {
      const fechaInicio = new Date(this.currentFilters.dateFrom);
      filtradas = filtradas.filter(p => new Date(p.fechaProduccion) >= fechaInicio);
    }

    // Filtro por fecha de fin
    if (this.currentFilters.dateTo) {
      const fechaFin = new Date(this.currentFilters.dateTo);
      fechaFin.setHours(23, 59, 59, 999); // Fin del día
      filtradas = filtradas.filter(p => new Date(p.fechaProduccion) <= fechaFin);
    }

    // Filtro por categoría (tipo de producto)
    if (this.currentFilters.category) {
      filtradas = filtradas.filter(p =>
        p.tipoProducto.toLowerCase() === this.currentFilters.category.toLowerCase()
      );
    }

    // Aplicar ordenamiento
    filtradas = this.aplicarOrdenamiento(filtradas);

    this.produccionesFiltradas = filtradas;
  }

  private aplicarOrdenamiento(producciones: ProduccionData[]): ProduccionData[] {
    return producciones.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (this.currentFilters.sortBy) {
        case 'fecha':
          aValue = new Date(a.fechaProduccion).getTime();
          bValue = new Date(b.fechaProduccion).getTime();
          break;
        case 'tipo':
          aValue = a.tipoProducto;
          bValue = b.tipoProducto;
          break;
        case 'cantidad':
          aValue = a.cantidad;
          bValue = b.cantidad;
          break;
        case 'ingresos':
          aValue = a.ingresosGenerados;
          bValue = b.ingresosGenerados;
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

  async onSubmit() {
    if (this.produccionForm.valid) {
      this.isLoading = true;
      try {
        const formValue = this.produccionForm.value;
        const produccionData: ProduccionData = {
          fechaProduccion: formValue.fechaProduccion,
          tipoProducto: formValue.tipoProducto,
          cantidad: Number(formValue.cantidad),
          unidad: formValue.unidad,
          costoOperativo: Number(formValue.costoOperativo),
          ingresosGenerados: Number(formValue.ingresosGenerados),
          observaciones: formValue.observaciones,
          createdBy: 'user-id', // TODO: Obtener del auth service
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        if (this.isEditing && this.editingId) {
          await this.firebaseService.updateDocument('produccion', this.editingId, produccionData);
          this.showToast('Producción actualizada exitosamente', 'success');
        } else {
          const id = await this.firebaseService.createDocument('produccion', produccionData);
          this.showToast('Producción registrada exitosamente', 'success');
        }

        this.resetForm();
        this.loadProducciones();
      } catch (error) {
        console.error('Error saving produccion:', error);
        this.showToast('Error al guardar la producción', 'danger');
      } finally {
        this.isLoading = false;
      }
    } else {
      this.showToast('Por favor complete todos los campos requeridos', 'warning');
    }
  }

  editProduccion(produccion: ProduccionData) {
    this.isEditing = true;
    this.editingId = produccion.id!;
    this.produccionForm.patchValue({
      fechaProduccion: produccion.fechaProduccion,
      tipoProducto: produccion.tipoProducto,
      cantidad: produccion.cantidad,
      unidad: produccion.unidad,
      costoOperativo: produccion.costoOperativo,
      ingresosGenerados: produccion.ingresosGenerados,
      observaciones: produccion.observaciones
    });
  }

  async deleteProduccion(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Está seguro de que desea eliminar esta producción?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.firebaseService.deleteDocument('produccion', id);
              this.showToast('Producción eliminada exitosamente', 'success');
              this.loadProducciones();
            } catch (error) {
              console.error('Error deleting produccion:', error);
              this.showToast('Error al eliminar la producción', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  resetForm() {
    this.produccionForm.reset({
      unidad: 'kg'
    });
    this.isEditing = false;
    this.editingId = null;
  }

  getTotalIngresos(): number {
    return this.produccionesFiltradas.reduce((total, prod) => total + prod.ingresosGenerados, 0);
  }

  getTotalCostos(): number {
    return this.produccionesFiltradas.reduce((total, prod) => total + prod.costoOperativo, 0);
  }

  getBeneficioNeto(): number {
    return this.getTotalIngresos() - this.getTotalCostos();
  }

  getProduccionesMostradas(): ProduccionData[] {
    return this.produccionesFiltradas.length > 0 ? this.produccionesFiltradas : this.producciones;
  }

  getCurrentDate(): string {
    return new Date().toISOString();
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}