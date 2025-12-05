import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CriaderoActivoService } from '../../services/criadero-activo.service';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';

interface Producto {
  id?: string;
  nombre: string;
  categoria: string;
  stock: number;
  stockMinimo: number;
  precio: number;
  proveedor: string;
  descripcion?: string;
  activo: boolean;
  criaderoId?: string;
}

interface Proveedor {
  id?: string;
  nombre: string;
  contacto?: string;
  email?: string;
  telefono?: string;
  activo: boolean;
}

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventarioPage implements OnInit {
  criaderoActivo: any = null;
  productos: Producto[] = [];
  proveedores: Proveedor[] = [];
  productosFiltrados: Producto[] = [];
  isLoading = false;
  showForm = false;
  filtroCategoria = '';
  filtroProveedor = '';

  // Formulario nuevo producto
  nuevoProducto: Producto = {
    nombre: '',
    categoria: 'alimentacion',
    stock: 0,
    stockMinimo: 5,
    precio: 0,
    proveedor: '',
    descripcion: '',
    activo: true
  };

  // Categorías disponibles
  categorias = [
    { value: 'alimentacion', label: 'Alimentación' },
    { value: 'medicamentos', label: 'Medicamentos' },
    { value: 'herrajes', label: 'Herrajes' },
    { value: 'limpieza', label: 'Limpieza' },
    { value: 'equipos', label: 'Equipos' },
    { value: 'insumos', label: 'Insumos' },
    { value: 'otros', label: 'Otros' }
  ];

  constructor(
    private criaderoService: CriaderoActivoService,
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.criaderoService.criaderoActivo$.subscribe(c => {
      this.criaderoActivo = c;
      if (c) {
        this.cargarDatos();
      }
    });
  }

  async cargarDatos() {
    if (!this.criaderoActivo) return;

    this.isLoading = true;
    try {
      // Cargar productos
      const productosData = await this.firebaseService.queryDocuments('inventario', [
        { field: 'criaderoId', operator: '==', value: this.criaderoActivo.id },
        { field: 'activo', operator: '==', value: true }
      ]);

      this.productos = productosData.map(p => ({
        ...p,
        stock: p.stock || 0,
        stockMinimo: p.stockMinimo || 5
      }));

      // Cargar proveedores
      const proveedoresData = await this.firebaseService.queryDocuments('proveedores', [
        { field: 'criaderoId', operator: '==', value: this.criaderoActivo.id },
        { field: 'activo', operator: '==', value: true }
      ]);

      this.proveedores = proveedoresData;

      this.aplicarFiltros();
    } catch (error) {
      console.error('Error cargando datos de inventario:', error);
    } finally {
      this.isLoading = false;
    }
  }

  aplicarFiltros() {
    let filtrados = [...this.productos];

    if (this.filtroCategoria) {
      filtrados = filtrados.filter(p => p.categoria === this.filtroCategoria);
    }

    if (this.filtroProveedor) {
      filtrados = filtrados.filter(p => p.proveedor === this.filtroProveedor);
    }

    this.productosFiltrados = filtrados;
  }

  onFiltroChange() {
    this.aplicarFiltros();
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.nuevoProducto = {
      nombre: '',
      categoria: 'alimentacion',
      stock: 0,
      stockMinimo: 5,
      precio: 0,
      proveedor: '',
      descripcion: '',
      activo: true
    };
  }

  async agregarProducto() {
    if (!this.nuevoProducto.nombre || !this.criaderoActivo) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      this.isLoading = true;
      const productoData = {
        ...this.nuevoProducto,
        criaderoId: this.criaderoActivo.id,
        precio: this.nuevoProducto.precio * 100, // Convertir a centavos
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.firebaseService.createDocument('inventario', productoData);
      await this.cargarDatos();
      this.resetForm();
      this.showForm = false;
    } catch (error) {
      console.error('Error creando producto:', error);
      alert('Error al crear el producto');
    } finally {
      this.isLoading = false;
    }
  }

  async eliminarProducto(productoId: string) {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      try {
        this.isLoading = true;
        await this.firebaseService.updateDocument('inventario', productoId, {
          activo: false,
          updatedAt: new Date()
        });
        await this.cargarDatos();
      } catch (error) {
        console.error('Error eliminando producto:', error);
        alert('Error al eliminar el producto');
      } finally {
        this.isLoading = false;
      }
    }
  }

  getEstadoStock(producto: Producto): 'critico' | 'bajo' | 'normal' {
    if (producto.stock <= producto.stockMinimo * 0.5) return 'critico';
    if (producto.stock <= producto.stockMinimo) return 'bajo';
    return 'normal';
  }

  getEstadoStockColor(producto: Producto): string {
    const estado = this.getEstadoStock(producto);
    switch (estado) {
      case 'critico': return 'danger';
      case 'bajo': return 'warning';
      case 'normal': return 'success';
      default: return 'medium';
    }
  }

  getEstadoStockTexto(producto: Producto): string {
    const estado = this.getEstadoStock(producto);
    switch (estado) {
      case 'critico': return 'Crítico';
      case 'bajo': return 'Bajo';
      case 'normal': return 'Normal';
      default: return '';
    }
  }

  getNombreProveedor(proveedorId: string): string {
    const proveedor = this.proveedores.find(p => p.id === proveedorId);
    return proveedor ? proveedor.nombre : 'Sin proveedor';
  }

  getCategoriaLabel(categoria: string): string {
    const cat = this.categorias.find(c => c.value === categoria);
    return cat ? cat.label : categoria;
  }

  formatPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(precio / 100);
  }

  getProductosPorEstado(estado: 'critico' | 'bajo' | 'normal'): Producto[] {
    return this.productosFiltrados.filter(p => this.getEstadoStock(p) === estado);
  }

  getEstadisticasInventario() {
    return {
      total: this.productosFiltrados.length,
      critico: this.getProductosPorEstado('critico').length,
      bajo: this.getProductosPorEstado('bajo').length,
      normal: this.getProductosPorEstado('normal').length,
      valorTotal: this.productosFiltrados.reduce((sum, p) => sum + (p.stock * p.precio), 0) / 100
    };
  }
}
