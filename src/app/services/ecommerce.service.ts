import { Injectable } from '@angular/core';
import { db, storage } from '../firebase.config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  addDoc,
  onSnapshot
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Producto {
  id?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precioOferta?: number;
  categoria: string;
  subcategoria?: string;
  criaderoId: string;
  criaderoNombre: string;
  stock: number;
  stockMinimo: number;
  activo: boolean;
  destacado: boolean;
  imagenes: string[];
  caracteristicas: {
    tipo: string;
    valor: string;
  }[];
  peso?: number;
  dimensiones?: {
    largo: number;
    ancho: number;
    alto: number;
  };
  tiempoPreparacion: number; // en días
  costoEnvio: number;
  envioGratis: boolean;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CaballoVenta {
  id?: string;
  caballoId: string;
  nombre: string;
  nombreCriadero: string;
  precio: number;
  descripcion: string;
  edad: number;
  sexo: 'macho' | 'hembra';
  raza: string;
  pelaje: string;
  altura?: number;
  peso?: number;
  criaderoId: string;
  criaderoNombre: string;
  ubicacion: string;
  imagenes: string[];
  documentos: {
    nombre: string;
    url: string;
    tipo: string;
  }[];
  caracteristicas: {
    nombre: string;
    valor: string;
  }[];
  activo: boolean;
  destacado: boolean;
  negociable: boolean;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ReservaServicio {
  id?: string;
  servicioId: string;
  servicioNombre: string;
  clienteId: string;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
  caballoId?: string;
  caballoNombre?: string;
  fechaReserva: Timestamp;
  horaReserva: string;
  duracionEstimada: number; // en minutos
  precio: number;
  notas?: string;
  estado: 'pendiente' | 'confirmada' | 'en_progreso' | 'completada' | 'cancelada';
  metodoPago?: string;
  pagado: boolean;
  recordatorioEnviado: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Pedido {
  id?: string;
  numeroPedido: string;
  clienteId: string;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
  items: {
    productoId: string;
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    imagen?: string;
  }[];
  subtotal: number;
  descuento: number;
  costoEnvio: number;
  total: number;
  estado: 'pendiente' | 'pagado' | 'en_preparacion' | 'enviado' | 'entregado' | 'cancelado';
  metodoPago: string;
  direccionEnvio: {
    nombre: string;
    direccion: string;
    ciudad: string;
    departamento: string;
    codigoPostal?: string;
    telefono: string;
    instrucciones?: string;
  };
  notas?: string;
  fechaEntregaEstimada?: Timestamp;
  fechaEntregaReal?: Timestamp;
  trackingNumber?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CarritoItem {
  productoId: string;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class EcommerceService {

  private carritoSubject = new BehaviorSubject<CarritoItem[]>([]);
  public carrito$ = this.carritoSubject.asObservable();

  constructor() {
    this.cargarCarrito();
  }

  // ===============================
  // GESTIÓN DE PRODUCTOS
  // ===============================

  async crearProducto(producto: Omit<Producto, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'productos'), {
        ...producto,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creando producto:', error);
      throw error;
    }
  }

  async actualizarProducto(id: string, producto: Partial<Producto>): Promise<void> {
    try {
      await updateDoc(doc(db, 'productos', id), {
        ...producto,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error actualizando producto:', error);
      throw error;
    }
  }

  async eliminarProducto(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'productos', id));
    } catch (error) {
      console.error('Error eliminando producto:', error);
      throw error;
    }
  }

  async obtenerProducto(id: string): Promise<Producto | null> {
    try {
      const docSnap = await getDoc(doc(db, 'productos', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Producto;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo producto:', error);
      throw error;
    }
  }

  async obtenerProductos(criaderoId?: string, categoria?: string, limitCount = 20): Promise<Producto[]> {
    try {
      let q = query(collection(db, 'productos'), where('activo', '==', true));

      if (criaderoId) {
        q = query(q, where('criaderoId', '==', criaderoId));
      }

      if (categoria) {
        q = query(q, where('categoria', '==', categoria));
      }

      q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Producto));
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      throw error;
    }
  }

  async obtenerProductosDestacados(limitCount = 10): Promise<Producto[]> {
    try {
      const q = query(
        collection(db, 'productos'),
        where('activo', '==', true),
        where('destacado', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Producto));
    } catch (error) {
      console.error('Error obteniendo productos destacados:', error);
      throw error;
    }
  }

  // ===============================
  // MARKETPLACE DE CABALLOS
  // ===============================

  async publicarCaballoVenta(caballo: Omit<CaballoVenta, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'caballos_venta'), {
        ...caballo,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error publicando caballo en venta:', error);
      throw error;
    }
  }

  async actualizarCaballoVenta(id: string, caballo: Partial<CaballoVenta>): Promise<void> {
    try {
      await updateDoc(doc(db, 'caballos_venta', id), {
        ...caballo,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error actualizando caballo en venta:', error);
      throw error;
    }
  }

  async obtenerCaballosVenta(filtros?: {
    criaderoId?: string;
    precioMin?: number;
    precioMax?: number;
    edadMin?: number;
    edadMax?: number;
    sexo?: string;
    raza?: string;
  }, limitCount = 20): Promise<CaballoVenta[]> {
    try {
      let q = query(collection(db, 'caballos_venta'), where('activo', '==', true));

      if (filtros?.criaderoId) {
        q = query(q, where('criaderoId', '==', filtros.criaderoId));
      }

      if (filtros?.sexo) {
        q = query(q, where('sexo', '==', filtros.sexo));
      }

      if (filtros?.raza) {
        q = query(q, where('raza', '==', filtros.raza));
      }

      q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));

      const querySnapshot = await getDocs(q);
      let caballos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CaballoVenta));

      // Filtros adicionales que no se pueden hacer en Firestore
      if (filtros?.precioMin) {
        caballos = caballos.filter(c => c.precio >= filtros.precioMin!);
      }

      if (filtros?.precioMax) {
        caballos = caballos.filter(c => c.precio <= filtros.precioMax!);
      }

      if (filtros?.edadMin) {
        caballos = caballos.filter(c => c.edad >= filtros.edadMin!);
      }

      if (filtros?.edadMax) {
        caballos = caballos.filter(c => c.edad <= filtros.edadMax!);
      }

      return caballos;
    } catch (error) {
      console.error('Error obteniendo caballos en venta:', error);
      throw error;
    }
  }

  // ===============================
  // SISTEMA DE RESERVAS
  // ===============================

  async crearReserva(reserva: Omit<ReservaServicio, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'reservas_servicios'), {
        ...reserva,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creando reserva:', error);
      throw error;
    }
  }

  async actualizarReserva(id: string, reserva: Partial<ReservaServicio>): Promise<void> {
    try {
      await updateDoc(doc(db, 'reservas_servicios', id), {
        ...reserva,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error actualizando reserva:', error);
      throw error;
    }
  }

  async obtenerReservasCliente(clienteId: string): Promise<ReservaServicio[]> {
    try {
      const q = query(
        collection(db, 'reservas_servicios'),
        where('clienteId', '==', clienteId),
        orderBy('fechaReserva', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReservaServicio));
    } catch (error) {
      console.error('Error obteniendo reservas del cliente:', error);
      throw error;
    }
  }

  async obtenerReservasPorFecha(fecha: Date): Promise<ReservaServicio[]> {
    try {
      const inicioDia = new Date(fecha);
      inicioDia.setHours(0, 0, 0, 0);

      const finDia = new Date(fecha);
      finDia.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, 'reservas_servicios'),
        where('fechaReserva', '>=', Timestamp.fromDate(inicioDia)),
        where('fechaReserva', '<=', Timestamp.fromDate(finDia)),
        orderBy('fechaReserva')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReservaServicio));
    } catch (error) {
      console.error('Error obteniendo reservas por fecha:', error);
      throw error;
    }
  }

  // ===============================
  // GESTIÓN DE PEDIDOS
  // ===============================

  async crearPedido(pedido: Omit<Pedido, 'id' | 'numeroPedido' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Generar número de pedido único
      const numeroPedido = await this.generarNumeroPedido();

      const docRef = await addDoc(collection(db, 'pedidos'), {
        ...pedido,
        numeroPedido,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creando pedido:', error);
      throw error;
    }
  }

  async actualizarPedido(id: string, pedido: Partial<Pedido>): Promise<void> {
    try {
      await updateDoc(doc(db, 'pedidos', id), {
        ...pedido,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error actualizando pedido:', error);
      throw error;
    }
  }

  async obtenerPedido(id: string): Promise<Pedido | null> {
    try {
      const docSnap = await getDoc(doc(db, 'pedidos', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Pedido;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo pedido:', error);
      throw error;
    }
  }

  async obtenerPedidosCliente(clienteId: string): Promise<Pedido[]> {
    try {
      const q = query(
        collection(db, 'pedidos'),
        where('clienteId', '==', clienteId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pedido));
    } catch (error) {
      console.error('Error obteniendo pedidos del cliente:', error);
      throw error;
    }
  }

  // ===============================
  // CARRITO DE COMPRAS
  // ===============================

  agregarAlCarrito(producto: Producto, cantidad = 1): void {
    const carritoActual = this.carritoSubject.value;
    const itemExistente = carritoActual.find(item => item.productoId === producto.id);

    if (itemExistente) {
      itemExistente.cantidad += cantidad;
      itemExistente.subtotal = itemExistente.cantidad * itemExistente.precioUnitario;
    } else {
      const nuevoItem: CarritoItem = {
        productoId: producto.id!,
        producto,
        cantidad,
        precioUnitario: producto.precioOferta || producto.precio,
        subtotal: (producto.precioOferta || producto.precio) * cantidad
      };
      carritoActual.push(nuevoItem);
    }

    this.guardarCarrito(carritoActual);
    this.carritoSubject.next([...carritoActual]);
  }

  removerDelCarrito(productoId: string): void {
    const carritoActual = this.carritoSubject.value.filter(item => item.productoId !== productoId);
    this.guardarCarrito(carritoActual);
    this.carritoSubject.next(carritoActual);
  }

  actualizarCantidad(productoId: string, cantidad: number): void {
    const carritoActual = this.carritoSubject.value;
    const item = carritoActual.find(item => item.productoId === productoId);

    if (item && cantidad > 0) {
      item.cantidad = cantidad;
      item.subtotal = item.cantidad * item.precioUnitario;
      this.guardarCarrito(carritoActual);
      this.carritoSubject.next([...carritoActual]);
    } else if (item && cantidad <= 0) {
      this.removerDelCarrito(productoId);
    }
  }

  vaciarCarrito(): void {
    this.guardarCarrito([]);
    this.carritoSubject.next([]);
  }

  obtenerTotalCarrito(): number {
    return this.carritoSubject.value.reduce((total, item) => total + item.subtotal, 0);
  }

  obtenerCantidadItems(): number {
    return this.carritoSubject.value.reduce((total, item) => total + item.cantidad, 0);
  }

  private guardarCarrito(carrito: CarritoItem[]): void {
    localStorage.setItem('carrito_ecommerce', JSON.stringify(carrito));
  }

  private cargarCarrito(): void {
    const carritoGuardado = localStorage.getItem('carrito_ecommerce');
    if (carritoGuardado) {
      try {
        const carrito = JSON.parse(carritoGuardado);
        this.carritoSubject.next(carrito);
      } catch (error) {
        console.error('Error cargando carrito:', error);
      }
    }
  }

  // ===============================
  // UTILIDADES
  // ===============================

  private async generarNumeroPedido(): Promise<string> {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    // Obtener el último número de pedido del día
    const inicioDia = new Date(fecha);
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);

    try {
      const q = query(
        collection(db, 'pedidos'),
        where('createdAt', '>=', Timestamp.fromDate(inicioDia)),
        where('createdAt', '<=', Timestamp.fromDate(finDia)),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      const ultimoNumero = querySnapshot.docs.length > 0 ?
        parseInt(querySnapshot.docs[0].data()['numeroPedido'].split('-')[1]) : 0;

      const numeroSecuencial = String(ultimoNumero + 1).padStart(4, '0');
      return `PED-${year}${month}${day}-${numeroSecuencial}`;
    } catch (error) {
      console.error('Error generando número de pedido:', error);
      // Fallback en caso de error
      return `PED-${year}${month}${day}-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`;
    }
  }

  // ===============================
  // SUBIDA DE ARCHIVOS
  // ===============================

  async subirImagenProducto(productoId: string, archivo: File, indice: number = 0): Promise<string> {
    try {
      const extension = archivo.name.split('.').pop();
      const nombreArchivo = `productos/${productoId}/imagen_${indice}_${Date.now()}.${extension}`;
      const storageRef = ref(storage, nombreArchivo);

      const snapshot = await uploadBytes(storageRef, archivo);
      const url = await getDownloadURL(snapshot.ref);

      return url;
    } catch (error) {
      console.error('Error subiendo imagen de producto:', error);
      throw error;
    }
  }

  async subirImagenCaballo(caballoId: string, archivo: File, indice: number = 0): Promise<string> {
    try {
      const extension = archivo.name.split('.').pop();
      const nombreArchivo = `caballos_venta/${caballoId}/imagen_${indice}_${Date.now()}.${extension}`;
      const storageRef = ref(storage, nombreArchivo);

      const snapshot = await uploadBytes(storageRef, archivo);
      const url = await getDownloadURL(snapshot.ref);

      return url;
    } catch (error) {
      console.error('Error subiendo imagen de caballo:', error);
      throw error;
    }
  }

  async eliminarImagen(url: string): Promise<void> {
    try {
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      throw error;
    }
  }
}