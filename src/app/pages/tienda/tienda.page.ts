import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EcommerceService, Producto, CarritoItem } from '../../services/ecommerce.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './tienda.page.html',
  styleUrls: ['./tienda.page.scss']
})
export class TiendaPage implements OnInit, OnDestroy {

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productosDestacados: Producto[] = [];
  carrito: CarritoItem[] = [];
  loading = false;
  userRole: string = '';

  // Filtros
  filtros = {
    categoria: '',
    precioMin: null as number | null,
    precioMax: null as number | null,
    busqueda: ''
  };

  categorias = [
    { value: '', label: 'Todas las categorías' },
    { value: 'alimentacion', label: 'Alimentación' },
    { value: 'herrajes', label: 'Herrajes' },
    { value: 'veterinario', label: 'Productos Veterinarios' },
    { value: 'accesorios', label: 'Accesorios' },
    { value: 'ropa', label: 'Ropa y Equipo' },
    { value: 'otros', label: 'Otros' }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private ecommerceService: EcommerceService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarDatos();
    this.suscribirACarrito();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private async cargarDatos() {
    this.loading = true;
    try {
      // Cargar productos
      const [productos, destacados] = await Promise.all([
        this.ecommerceService.obtenerProductos(),
        this.ecommerceService.obtenerProductosDestacados()
      ]);

      this.productos = productos;
      this.productosDestacados = destacados;
      this.aplicarFiltros();

      // Obtener rol del usuario
      this.userRole = this.authService.getRole() || '';

    } catch (error) {
      console.error('Error cargando datos:', error);
      this.mostrarToast('Error al cargar los productos', 'danger');
    } finally {
      this.loading = false;
    }
  }

  private suscribirACarrito() {
    const carritoSub = this.ecommerceService.carrito$.subscribe(carrito => {
      this.carrito = carrito;
    });
    this.subscriptions.push(carritoSub);
  }

  aplicarFiltros() {
    let filtrados = [...this.productos];

    // Filtro por categoría
    if (this.filtros.categoria) {
      filtrados = filtrados.filter(p => p.categoria === this.filtros.categoria);
    }

    // Filtro por precio
    if (this.filtros.precioMin !== null) {
      filtrados = filtrados.filter(p => (p.precioOferta || p.precio) >= this.filtros.precioMin!);
    }

    if (this.filtros.precioMax !== null) {
      filtrados = filtrados.filter(p => (p.precioOferta || p.precio) <= this.filtros.precioMax!);
    }

    // Filtro por búsqueda
    if (this.filtros.busqueda.trim()) {
      const termino = this.filtros.busqueda.toLowerCase();
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        p.descripcion.toLowerCase().includes(termino) ||
        p.categoria.toLowerCase().includes(termino)
      );
    }

    this.productosFiltrados = filtrados;
  }

  onFiltrosChange() {
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.filtros = {
      categoria: '',
      precioMin: null,
      precioMax: null,
      busqueda: ''
    };
    this.aplicarFiltros();
  }

  async agregarAlCarrito(producto: Producto) {
    if (!this.authService.isAuthenticated()) {
      this.mostrarAlerta('Inicia sesión', 'Debes iniciar sesión para agregar productos al carrito.');
      return;
    }

    this.ecommerceService.agregarAlCarrito(producto);
    this.mostrarToast('Producto agregado al carrito', 'success');
  }

  verCarrito() {
    this.router.navigate(['/carrito']);
  }

  verProducto(producto: Producto) {
    this.router.navigate(['/producto', producto.id]);
  }

  getPrecioFinal(producto: Producto): number {
    return producto.precioOferta || producto.precio;
  }

  tieneOferta(producto: Producto): boolean {
    return producto.precioOferta !== undefined && producto.precioOferta < producto.precio;
  }

  getDescuento(producto: Producto): number {
    if (this.tieneOferta(producto)) {
      return Math.round(((producto.precio - producto.precioOferta!) / producto.precio) * 100);
    }
    return 0;
  }

  formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  }

  getCantidadEnCarrito(): number {
    return this.ecommerceService.obtenerCantidadItems();
  }

  getTotalCarrito(): number {
    return this.ecommerceService.obtenerTotalCarrito();
  }

  private async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }

  private async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Iniciar Sesión',
          handler: () => {
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }
}