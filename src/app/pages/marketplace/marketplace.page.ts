import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EcommerceService, CaballoVenta } from '../../services/ecommerce.service';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { CriaderoActivoService } from '../../services/criadero-activo.service';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './marketplace.page.html',
  styleUrls: ['./marketplace.page.scss']
})
export class MarketplacePage implements OnInit, OnDestroy {

  caballos: CaballoVenta[] = [];
  caballosFiltrados: CaballoVenta[] = [];
  loading = false;
  userRole: string = '';

  // Propiedades para publicar anuncio
  caballosDisponibles: any[] = [];
  showPublicarForm = false;
  nuevoAnuncio = {
    caballoId: '',
    precio: 0,
    descripcion: '',
    negociable: false,
    destacado: false,
    imagenes: [] as string[]
  };

  // Filtros avanzados
  filtros = {
    precioMin: null as number | null,
    precioMax: null as number | null,
    edadMin: null as number | null,
    edadMax: null as number | null,
    sexo: '',
    raza: '',
    criadero: '',
    busqueda: '',
    negociable: null as boolean | null,
    destacado: null as boolean | null
  };

  razas = [
    { value: '', label: 'Todas las razas' },
    { value: 'pura_sangre_ingles', label: 'Pura Sangre Inglés' },
    { value: 'cuarto_de_milla', label: 'Cuarto de Milla' },
    { value: 'andaluz', label: 'Andaluz' },
    { value: 'arabe', label: 'Árabe' },
    { value: 'criollo', label: 'Criollo' },
    { value: 'appaloosa', label: 'Appaloosa' },
    { value: 'otra', label: 'Otra' }
  ];

  sexos = [
    { value: '', label: 'Todos' },
    { value: 'macho', label: 'Macho' },
    { value: 'hembra', label: 'Hembra' }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private ecommerceService: EcommerceService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router,
    private modalController: ModalController,
    private firebaseService: FirebaseService,
    private criaderoService: CriaderoActivoService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private async cargarDatos() {
    this.loading = true;
    try {
      const caballos = await this.ecommerceService.obtenerCaballosVenta();
      this.caballos = caballos;
      this.aplicarFiltros();

      // Obtener rol del usuario
      this.userRole = this.authService.getRole() || '';

    } catch (error) {
      console.error('Error cargando caballos:', error);
      this.mostrarToast('Error al cargar los caballos', 'danger');
    } finally {
      this.loading = false;
    }
  }

  aplicarFiltros() {
    let filtrados = [...this.caballos];

    // Filtro por precio
    if (this.filtros.precioMin !== null) {
      filtrados = filtrados.filter(c => c.precio >= this.filtros.precioMin!);
    }

    if (this.filtros.precioMax !== null) {
      filtrados = filtrados.filter(c => c.precio <= this.filtros.precioMax!);
    }

    // Filtro por edad
    if (this.filtros.edadMin !== null) {
      filtrados = filtrados.filter(c => c.edad >= this.filtros.edadMin!);
    }

    if (this.filtros.edadMax !== null) {
      filtrados = filtrados.filter(c => c.edad <= this.filtros.edadMax!);
    }

    // Filtro por sexo
    if (this.filtros.sexo) {
      filtrados = filtrados.filter(c => c.sexo === this.filtros.sexo);
    }

    // Filtro por raza
    if (this.filtros.raza) {
      filtrados = filtrados.filter(c => c.raza === this.filtros.raza);
    }

    // Filtro por criadero
    if (this.filtros.criadero) {
      filtrados = filtrados.filter(c =>
        c.criaderoNombre.toLowerCase().includes(this.filtros.criadero.toLowerCase())
      );
    }

    // Filtro por negociable
    if (this.filtros.negociable !== null) {
      filtrados = filtrados.filter(c => c.negociable === this.filtros.negociable);
    }

    // Filtro por destacado
    if (this.filtros.destacado !== null) {
      filtrados = filtrados.filter(c => c.destacado === this.filtros.destacado);
    }

    // Filtro por búsqueda general
    if (this.filtros.busqueda.trim()) {
      const termino = this.filtros.busqueda.toLowerCase();
      filtrados = filtrados.filter(c =>
        c.nombre.toLowerCase().includes(termino) ||
        c.nombreCriadero.toLowerCase().includes(termino) ||
        c.descripcion.toLowerCase().includes(termino) ||
        c.raza.toLowerCase().includes(termino)
      );
    }

    this.caballosFiltrados = filtrados;
  }

  onFiltrosChange() {
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.filtros = {
      precioMin: null,
      precioMax: null,
      edadMin: null,
      edadMax: null,
      sexo: '',
      raza: '',
      criadero: '',
      busqueda: '',
      negociable: null,
      destacado: null
    };
    this.aplicarFiltros();
  }

  verCaballo(caballo: CaballoVenta) {
    this.router.navigate(['/caballo-venta', caballo.id]);
  }

  async contactarVendedor(caballo: CaballoVenta) {
    if (!this.authService.isAuthenticated()) {
      this.mostrarAlerta('Inicia sesión', 'Debes iniciar sesión para contactar al vendedor.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Contactar Vendedor',
      message: `¿Quieres contactar al vendedor de ${caballo.nombre}?`,
      inputs: [
        {
          name: 'mensaje',
          type: 'textarea',
          placeholder: 'Escribe tu mensaje...',
          value: `Hola, estoy interesado en ${caballo.nombre}. ¿Podemos hablar sobre el precio?`
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Enviar Mensaje',
          handler: (data) => {
            if (data.mensaje.trim()) {
              this.enviarMensaje(caballo, data.mensaje);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private async enviarMensaje(caballo: CaballoVenta, mensaje: string) {
    try {
      // Aquí se implementaría el envío de mensaje
      // Por ahora, solo mostramos un toast
      this.mostrarToast('Mensaje enviado al vendedor', 'success');
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      this.mostrarToast('Error al enviar el mensaje', 'danger');
    }
  }

  formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  }

  getEdadTexto(edad: number): string {
    if (edad === 1) return '1 año';
    return `${edad} años`;
  }

  getRazaDisplay(raza: string): string {
    const razaEncontrada = this.razas.find(r => r.value === raza);
    return razaEncontrada ? razaEncontrada.label : raza;
  }

  toggleFiltrosAvanzados() {
    // Implementar toggle de filtros avanzados
  }

  ordenarPor(criterio: string) {
    switch (criterio) {
      case 'precio_asc':
        this.caballosFiltrados.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio_desc':
        this.caballosFiltrados.sort((a, b) => b.precio - a.precio);
        break;
      case 'edad_asc':
        this.caballosFiltrados.sort((a, b) => a.edad - b.edad);
        break;
      case 'edad_desc':
        this.caballosFiltrados.sort((a, b) => b.edad - a.edad);
        break;
      case 'reciente':
        this.caballosFiltrados.sort((a, b) =>
          b.createdAt.toMillis() - a.createdAt.toMillis()
        );
        break;
    }
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

  async publicarAnuncio() {
    if (this.userRole !== 'admin') {
      this.mostrarToast('Solo los administradores pueden publicar anuncios', 'warning');
      return;
    }

    // Cargar caballos disponibles para vender
    await this.cargarCaballosDisponibles();

    if (this.caballosDisponibles.length === 0) {
      this.mostrarToast('No tienes caballos disponibles para vender', 'warning');
      return;
    }

    // Usar un alert más simple con inputs separados
    const alert = await this.alertController.create({
      header: 'Publicar Anuncio',
      message: 'Ingresa los detalles del anuncio',
      inputs: [
        {
          name: 'caballoSeleccionado',
          type: 'text',
          placeholder: `Ej: ${this.caballosDisponibles[0]?.nombre || 'Nombre del caballo'}`
        },
        {
          name: 'precio',
          type: 'number',
          placeholder: 'Precio en COP',
          min: 0
        },
        {
          name: 'descripcion',
          type: 'textarea',
          placeholder: 'Descripción del caballo...'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Publicar',
          handler: async (data) => {
            if (data.caballoSeleccionado && data.precio && data.descripcion) {
              // Buscar el caballo por nombre
              const caballoSeleccionado = this.caballosDisponibles.find(c =>
                c.nombre.toLowerCase().includes(data.caballoSeleccionado.toLowerCase())
              );

              if (caballoSeleccionado) {
                await this.crearAnuncio({
                  caballoId: caballoSeleccionado.id,
                  precio: data.precio,
                  descripcion: data.descripcion
                });
                return true;
              } else {
                this.mostrarToast('Caballo no encontrado', 'warning');
                return false;
              }
            } else {
              this.mostrarToast('Completa todos los campos', 'warning');
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private async cargarCaballosDisponibles() {
    try {
      const criaderoActivo = this.criaderoService.getCriaderoActivo();
      if (criaderoActivo) {
        this.caballosDisponibles = await this.firebaseService.queryDocuments('caballos', [
          { field: 'criaderoId', operator: '==', value: criaderoActivo.id },
          { field: 'estado', operator: '==', value: 'activo' }
        ]);
      }
    } catch (error) {
      console.error('Error cargando caballos disponibles:', error);
      this.caballosDisponibles = [];
    }
  }

  private async crearAnuncio(data: any) {
    try {
      const criaderoActivo = this.criaderoService.getCriaderoActivo();
      const caballoSeleccionado = this.caballosDisponibles.find(c => c.id === data.caballoId);

      if (!criaderoActivo || !caballoSeleccionado) {
        this.mostrarToast('Error: Criadero o caballo no encontrado', 'danger');
        return;
      }

      const anuncioData = {
        caballoId: data.caballoId,
        nombre: caballoSeleccionado.nombre,
        nombreCriadero: criaderoActivo.nombre,
        precio: parseFloat(data.precio),
        descripcion: data.descripcion,
        edad: caballoSeleccionado.edad || 0,
        sexo: caballoSeleccionado.sexo || 'macho',
        raza: caballoSeleccionado.raza || 'No especificada',
        pelaje: caballoSeleccionado.pelaje || 'No especificado',
        altura: caballoSeleccionado.altura,
        peso: caballoSeleccionado.peso,
        criaderoId: criaderoActivo.id,
        criaderoNombre: criaderoActivo.nombre,
        ubicacion: criaderoActivo.ubicacion || 'No especificada',
        imagenes: caballoSeleccionado.imagenes || ['/assets/images/caballo-default.jpg'],
        documentos: [],
        caracteristicas: [],
        activo: true,
        destacado: false,
        negociable: false,
        createdBy: this.authService.getCurrentUser()?.id || ''
      };

      await this.ecommerceService.publicarCaballoVenta(anuncioData);
      this.mostrarToast('Anuncio publicado exitosamente', 'success');
      this.cargarDatos(); // Recargar la lista
    } catch (error) {
      console.error('Error creando anuncio:', error);
      this.mostrarToast('Error al publicar el anuncio', 'danger');
    }
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