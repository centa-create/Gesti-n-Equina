import { Injectable } from '@angular/core';
import { db } from '../firebase.config';
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
  Timestamp,
  addDoc,
  increment
} from 'firebase/firestore';
import { Observable, BehaviorSubject } from 'rxjs';

export interface ClienteCRM {
  id?: string;
  clienteId: string; // Referencia al cliente original
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fechaNacimiento?: Timestamp;
  genero?: 'masculino' | 'femenino' | 'otro';
  intereses: string[]; // 'caballos', 'productos', 'servicios', etc.
  segmento: 'nuevo' | 'regular' | 'vip' | 'inactivo';
  puntosFidelidad: number;
  nivelFidelidad: 'bronce' | 'plata' | 'oro' | 'platino';
  totalCompras: number;
  totalPedidos: number;
  ultimaCompra?: Timestamp;
  fechaRegistro: Timestamp;
  comunicaciones: {
    emailMarketing: boolean;
    smsPromociones: boolean;
    notificacionesApp: boolean;
    frecuenciaComunicacion: 'diaria' | 'semanal' | 'mensual' | 'nunca';
  };
  preferencias: {
    productosFavoritos: string[];
    serviciosInteres: string[];
    presupuestoMensual?: number;
    metodoPagoPreferido?: string;
  };
  historialInteracciones: InteraccionCliente[];
  activo: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface InteraccionCliente {
  id?: string;
  tipo: 'compra' | 'consulta' | 'queja' | 'sugerencia' | 'visita' | 'llamada' | 'email';
  descripcion: string;
  canal: 'telefono' | 'email' | 'app' | 'presencial' | 'redes_sociales';
  resultado?: 'positivo' | 'neutro' | 'negativo';
  valorCompra?: number;
  productosInvolucrados?: string[];
  notas?: string;
  usuarioResponsable: string;
  fecha: Timestamp;
}

export interface ProgramaFidelidad {
  id?: string;
  nombre: string;
  descripcion: string;
  tipo: 'puntos' | 'descuentos' | 'beneficios';
  activo: boolean;
  niveles: {
    nombre: string;
    puntosRequeridos: number;
    beneficios: {
      tipo: 'descuento_porcentaje' | 'descuento_fijo' | 'envio_gratis' | 'producto_gratis';
      valor: number;
      descripcion: string;
    }[];
  }[];
  reglasAcumulacion: {
    compraMinima: number;
    puntosPorPeso: number; // puntos por cada $1000
    puntosPorCompra: number;
    multiplicadorEventos: number; // multiplicador en eventos especiales
  };
  vigencia: {
    fechaInicio: Timestamp;
    fechaFin?: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CampanaMarketing {
  id?: string;
  nombre: string;
  descripcion: string;
  tipo: 'email' | 'sms' | 'push' | 'redes_sociales';
  segmentoObjetivo: string[];
  estado: 'borrador' | 'programada' | 'enviada' | 'cancelada';
  contenido: {
    asunto?: string;
    mensaje: string;
    imagenes?: string[];
    enlaces?: {
      texto: string;
      url: string;
    }[];
  };
  programacion: {
    fechaEnvio: Timestamp;
    zonaHoraria: string;
  };
  metricas: {
    enviados: number;
    entregados: number;
    abiertos: number;
    clics: number;
    conversiones: number;
    ingresosGenerados: number;
  };
  presupuesto: number;
  costoReal: number;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PuntosFidelidad {
  id?: string;
  clienteId: string;
  tipo: 'acumulado' | 'canjeado' | 'expirado' | 'bono';
  cantidad: number;
  motivo: string;
  referencia?: string; // ID del pedido, reserva, etc.
  fechaExpiracion?: Timestamp;
  fecha: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class CrmService {

  private clientesSubject = new BehaviorSubject<ClienteCRM[]>([]);
  public clientes$ = this.clientesSubject.asObservable();

  constructor() {
    this.cargarClientes();
  }

  // ===============================
  // GESTIÓN DE CLIENTES CRM
  // ===============================

  async crearClienteCRM(cliente: Omit<ClienteCRM, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'clientes_crm'), {
        ...cliente,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Actualizar lista de clientes
      this.cargarClientes();

      return docRef.id;
    } catch (error) {
      console.error('Error creando cliente CRM:', error);
      throw error;
    }
  }

  async actualizarClienteCRM(id: string, cliente: Partial<ClienteCRM>): Promise<void> {
    try {
      await updateDoc(doc(db, 'clientes_crm', id), {
        ...cliente,
        updatedAt: Timestamp.now()
      });

      // Actualizar lista de clientes
      this.cargarClientes();
    } catch (error) {
      console.error('Error actualizando cliente CRM:', error);
      throw error;
    }
  }

  async obtenerClienteCRM(id: string): Promise<ClienteCRM | null> {
    try {
      const docSnap = await getDoc(doc(db, 'clientes_crm', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as ClienteCRM;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo cliente CRM:', error);
      throw error;
    }
  }

  async obtenerClienteCRMPorClienteId(clienteId: string): Promise<ClienteCRM | null> {
    try {
      const q = query(
        collection(db, 'clientes_crm'),
        where('clienteId', '==', clienteId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as ClienteCRM;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo cliente CRM por clienteId:', error);
      throw error;
    }
  }

  async obtenerClientesCRM(filtros?: {
    segmento?: string;
    nivelFidelidad?: string;
    activo?: boolean;
  }, limitCount = 50): Promise<ClienteCRM[]> {
    try {
      let q = query(collection(db, 'clientes_crm'));

      if (filtros?.segmento) {
        q = query(q, where('segmento', '==', filtros.segmento));
      }

      if (filtros?.nivelFidelidad) {
        q = query(q, where('nivelFidelidad', '==', filtros.nivelFidelidad));
      }

      if (filtros?.activo !== undefined) {
        q = query(q, where('activo', '==', filtros.activo));
      }

      q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClienteCRM));
    } catch (error) {
      console.error('Error obteniendo clientes CRM:', error);
      throw error;
    }
  }

  // ===============================
  // SISTEMA DE FIDELIDAD
  // ===============================

  async acumularPuntos(clienteId: string, puntos: PuntosFidelidad): Promise<void> {
    try {
      // Agregar registro de puntos
      await addDoc(collection(db, 'puntos_fidelidad'), {
        ...puntos,
        fecha: Timestamp.now()
      });

      // Actualizar total de puntos del cliente
      const clienteCRM = await this.obtenerClienteCRMPorClienteId(clienteId);
      if (clienteCRM) {
        const nuevosPuntos = clienteCRM.puntosFidelidad + puntos.cantidad;
        const nuevoNivel = this.calcularNivelFidelidad(nuevosPuntos);

        await this.actualizarClienteCRM(clienteCRM.id!, {
          puntosFidelidad: nuevosPuntos,
          nivelFidelidad: nuevoNivel,
          ultimaCompra: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error acumulando puntos:', error);
      throw error;
    }
  }

  async canjearPuntos(clienteId: string, puntosRequeridos: number, motivo: string): Promise<boolean> {
    try {
      const clienteCRM = await this.obtenerClienteCRMPorClienteId(clienteId);
      if (!clienteCRM || clienteCRM.puntosFidelidad < puntosRequeridos) {
        return false;
      }

      // Registrar canje de puntos
      await addDoc(collection(db, 'puntos_fidelidad'), {
        clienteId,
        tipo: 'canjeado' as const,
        cantidad: -puntosRequeridos,
        motivo,
        fecha: Timestamp.now()
      });

      return true;
    } catch (error) {
      console.error('Error canjeando puntos:', error);
      throw error;
    }
  }

  async obtenerHistorialPuntos(clienteId: string, limitCount = 20): Promise<PuntosFidelidad[]> {
    try {
      const q = query(
        collection(db, 'puntos_fidelidad'),
        where('clienteId', '==', clienteId),
        orderBy('fecha', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PuntosFidelidad));
    } catch (error) {
      console.error('Error obteniendo historial de puntos:', error);
      throw error;
    }
  }

  private calcularNivelFidelidad(puntos: number): 'bronce' | 'plata' | 'oro' | 'platino' {
    if (puntos >= 10000) return 'platino';
    if (puntos >= 5000) return 'oro';
    if (puntos >= 1000) return 'plata';
    return 'bronce';
  }

  // ===============================
  // INTERACCIONES CON CLIENTES
  // ===============================

  async registrarInteraccion(clienteId: string, interaccion: Omit<InteraccionCliente, 'id' | 'fecha'>): Promise<void> {
    try {
      const nuevaInteraccion: InteraccionCliente = {
        ...interaccion,
        fecha: Timestamp.now()
      };

      // Agregar a la colección de interacciones
      await addDoc(collection(db, 'interacciones_clientes'), nuevaInteraccion);

      // Actualizar el historial en el cliente CRM
      const clienteCRM = await this.obtenerClienteCRMPorClienteId(clienteId);
      if (clienteCRM) {
        const historialActualizado = [...clienteCRM.historialInteracciones, nuevaInteraccion];
        // Mantener solo las últimas 50 interacciones
        if (historialActualizado.length > 50) {
          historialActualizado.splice(0, historialActualizado.length - 50);
        }

        await this.actualizarClienteCRM(clienteCRM.id!, {
          historialInteracciones: historialActualizado
        });
      }
    } catch (error) {
      console.error('Error registrando interacción:', error);
      throw error;
    }
  }

  async obtenerInteraccionesCliente(clienteId: string, limitCount = 20): Promise<InteraccionCliente[]> {
    try {
      const q = query(
        collection(db, 'interacciones_clientes'),
        where('clienteId', '==', clienteId),
        orderBy('fecha', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InteraccionCliente));
    } catch (error) {
      console.error('Error obteniendo interacciones del cliente:', error);
      throw error;
    }
  }

  // ===============================
  // PROGRAMAS DE FIDELIDAD
  // ===============================

  async crearProgramaFidelidad(programa: Omit<ProgramaFidelidad, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'programas_fidelidad'), {
        ...programa,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creando programa de fidelidad:', error);
      throw error;
    }
  }

  async obtenerProgramaFidelidadActivo(): Promise<ProgramaFidelidad | null> {
    try {
      const q = query(
        collection(db, 'programas_fidelidad'),
        where('activo', '==', true),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as ProgramaFidelidad;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo programa de fidelidad activo:', error);
      throw error;
    }
  }

  // ===============================
  // CAMPAÑAS DE MARKETING
  // ===============================

  async crearCampana(campana: Omit<CampanaMarketing, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'campanas_marketing'), {
        ...campana,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creando campaña:', error);
      throw error;
    }
  }

  async actualizarCampana(id: string, campana: Partial<CampanaMarketing>): Promise<void> {
    try {
      await updateDoc(doc(db, 'campanas_marketing', id), {
        ...campana,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error actualizando campaña:', error);
      throw error;
    }
  }

  async obtenerCampanas(estado?: string, limitCount = 20): Promise<CampanaMarketing[]> {
    try {
      let q = query(collection(db, 'campanas_marketing'));

      if (estado) {
        q = query(q, where('estado', '==', estado));
      }

      q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CampanaMarketing));
    } catch (error) {
      console.error('Error obteniendo campañas:', error);
      throw error;
    }
  }

  // ===============================
  // SEGMENTACIÓN Y ANÁLISIS
  // ===============================

  async segmentarClientes(): Promise<{
    nuevos: ClienteCRM[];
    regulares: ClienteCRM[];
    vip: ClienteCRM[];
    inactivos: ClienteCRM[];
  }> {
    try {
      const clientes = await this.obtenerClientesCRM({ activo: true });

      const ahora = new Date();
      const treintaDiasAtras = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
      const noventaDiasAtras = new Date(ahora.getTime() - 90 * 24 * 60 * 60 * 1000);

      return {
        nuevos: clientes.filter(c => c.fechaRegistro.toDate() > treintaDiasAtras),
        regulares: clientes.filter(c =>
          c.totalCompras > 0 &&
          c.ultimaCompra &&
          c.ultimaCompra.toDate() > noventaDiasAtras &&
          c.totalCompras < 5000000 // menos de $5M
        ),
        vip: clientes.filter(c =>
          c.totalCompras >= 5000000 ||
          c.nivelFidelidad === 'oro' ||
          c.nivelFidelidad === 'platino'
        ),
        inactivos: clientes.filter(c =>
          !c.ultimaCompra ||
          c.ultimaCompra.toDate() < noventaDiasAtras
        )
      };
    } catch (error) {
      console.error('Error segmentando clientes:', error);
      throw error;
    }
  }

  async obtenerEstadisticasCRM(): Promise<{
    totalClientes: number;
    clientesActivos: number;
    promedioCompras: number;
    totalPuntosAcumulados: number;
    conversionCampanas: number;
  }> {
    try {
      const clientes = await this.obtenerClientesCRM();

      const clientesActivos = clientes.filter(c => c.activo).length;
      const totalCompras = clientes.reduce((sum, c) => sum + c.totalCompras, 0);
      const totalPuntos = clientes.reduce((sum, c) => sum + c.puntosFidelidad, 0);

      return {
        totalClientes: clientes.length,
        clientesActivos,
        promedioCompras: clientesActivos > 0 ? totalCompras / clientesActivos : 0,
        totalPuntosAcumulados: totalPuntos,
        conversionCampanas: 0 // TODO: calcular basado en campañas
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas CRM:', error);
      throw error;
    }
  }

  // ===============================
  // COMUNICACIÓN AUTOMATIZADA
  // ===============================

  async enviarEmailMarketing(clienteId: string, asunto: string, contenido: string): Promise<void> {
    try {
      // Aquí se integraría con un servicio de email como SendGrid, Mailgun, etc.
      // Por ahora, registramos la intención de envío
      await this.registrarInteraccion(clienteId, {
        tipo: 'consulta',
        descripcion: `Email enviado: ${asunto}`,
        canal: 'email',
        resultado: 'positivo',
        usuarioResponsable: 'sistema',
        notas: contenido
      });

      console.log(`Email enviado a cliente ${clienteId}: ${asunto}`);
    } catch (error) {
      console.error('Error enviando email:', error);
      throw error;
    }
  }

  async enviarSMSPromocion(clienteId: string, mensaje: string): Promise<void> {
    try {
      // Aquí se integraría con un servicio de SMS como Twilio, etc.
      await this.registrarInteraccion(clienteId, {
        tipo: 'consulta',
        descripcion: `SMS enviado: ${mensaje.substring(0, 50)}...`,
        canal: 'telefono',
        resultado: 'positivo',
        usuarioResponsable: 'sistema',
        notas: mensaje
      });

      console.log(`SMS enviado a cliente ${clienteId}: ${mensaje}`);
    } catch (error) {
      console.error('Error enviando SMS:', error);
      throw error;
    }
  }

  // ===============================
  // UTILIDADES
  // ===============================

  private async cargarClientes(): Promise<void> {
    try {
      const clientes = await this.obtenerClientesCRM({ activo: true }, 100);
      this.clientesSubject.next(clientes);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  }

  // Método para actualizar segmento basado en comportamiento
  async actualizarSegmentoCliente(clienteId: string): Promise<void> {
    try {
      const cliente = await this.obtenerClienteCRMPorClienteId(clienteId);
      if (!cliente) return;

      let nuevoSegmento: 'nuevo' | 'regular' | 'vip' | 'inactivo' = 'regular';

      const ahora = new Date();
      const treintaDiasAtras = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
      const noventaDiasAtras = new Date(ahora.getTime() - 90 * 24 * 60 * 60 * 1000);

      if (cliente.fechaRegistro.toDate() > treintaDiasAtras) {
        nuevoSegmento = 'nuevo';
      } else if (!cliente.ultimaCompra || cliente.ultimaCompra.toDate() < noventaDiasAtras) {
        nuevoSegmento = 'inactivo';
      } else if (cliente.totalCompras >= 10000000 || cliente.nivelFidelidad === 'platino') {
        nuevoSegmento = 'vip';
      }

      if (cliente.segmento !== nuevoSegmento) {
        await this.actualizarClienteCRM(cliente.id!, { segmento: nuevoSegmento });
      }
    } catch (error) {
      console.error('Error actualizando segmento del cliente:', error);
      throw error;
    }
  }
}