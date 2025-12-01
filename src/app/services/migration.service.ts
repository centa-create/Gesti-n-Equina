import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { db } from '../firebase.config';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class MigrationService {

  constructor(private supabaseService: SupabaseService) { }

  /**
   * Migra todos los datos de Supabase a Firebase
   */
  async migrateAllData(): Promise<{ success: boolean; message: string; stats: any }> {
    try {
      const stats = {
        roles: 0,
        users: 0,
        criaderos: 0,
        clientes: 0,
        caballos: 0,
        proveedores: 0,
        servicios: 0,
        montadores: 0,
        herrajes: 0,
        finanzas: 0,
        inventario: 0,
        movimientos_inventario: 0,
        eventos: 0,
        notificaciones: 0,
        auditoria: 0
      };

      // Migrar en orden para mantener referencias
      stats.roles = await this.migrateRoles();
      stats.users = await this.migrateUsers();
      stats.criaderos = await this.migrateCriaderos();
      stats.clientes = await this.migrateClientes();
      stats.proveedores = await this.migrateProveedores();
      stats.caballos = await this.migrateCaballos();
      stats.montadores = await this.migrateMontadores();
      stats.herrajes = await this.migrateHerrajes();
      stats.servicios = await this.migrateServicios();
      stats.finanzas = await this.migrateTransacciones();
      stats.inventario = await this.migrateInventario();
      stats.movimientos_inventario = await this.migrateMovimientosInventario();
      stats.eventos = await this.migrateEventos();
      stats.notificaciones = await this.migrateNotificaciones();
      stats.auditoria = await this.migrateHistorialCambios();

      return {
        success: true,
        message: 'Migración completada exitosamente',
        stats
      };

    } catch (error) {
      console.error('Error en migración:', error);
      return {
        success: false,
        message: `Error en migración: ${error}`,
        stats: {}
      };
    }
  }

  private async migrateRoles(): Promise<number> {
    const { data, error } = await this.supabaseService.client
      .from('roles')
      .select('*');

    if (error) throw error;

    for (const role of data) {
      await setDoc(doc(db, 'roles', role.nombre), {
        id: role.nombre,
        nombre: role.nombre,
        descripcion: role.descripcion,
        createdAt: Timestamp.fromDate(new Date(role.created_at))
      });
    }

    return data.length;
  }

  private async migrateUsers(): Promise<number> {
    const { data, error } = await this.supabaseService.client
      .from('perfiles')
      .select(`
        *,
        roles (
          nombre
        )
      `);

    if (error) throw error;

    for (const perfil of data) {
      await setDoc(doc(db, 'users', perfil.id), {
        email: '', // Se obtendría de auth.users, pero por privacidad no lo hacemos
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        telefono: perfil.telefono,
        roleId: perfil.roles?.nombre || 'visitante',
        activo: perfil.activo,
        createdAt: Timestamp.fromDate(new Date(perfil.created_at)),
        updatedAt: Timestamp.fromDate(new Date(perfil.updated_at))
      });
    }

    return data.length;
  }

  private async migrateCriaderos(): Promise<number> {
    const { data, error } = await this.supabaseService.client
      .from('criaderos')
      .select('*');

    if (error) throw error;

    for (const criadero of data) {
      await setDoc(doc(db, 'criaderos', criadero.id), {
        id: criadero.id,
        nombre: criadero.nombre,
        descripcion: criadero.descripcion,
        direccion: criadero.direccion,
        telefono: criadero.telefono,
        email: criadero.email,
        capacidadMaxima: criadero.capacidad_maxima,
        activo: criadero.activo,
        createdBy: criadero.created_by,
        createdAt: Timestamp.fromDate(new Date(criadero.created_at)),
        updatedAt: Timestamp.fromDate(new Date(criadero.updated_at))
      });
    }

    return data.length;
  }

  private async migrateClientes(): Promise<number> {
    const { data, error } = await this.supabaseService.client
      .from('clientes')
      .select('*');

    if (error) throw error;

    for (const cliente of data) {
      await setDoc(doc(db, 'clientes', cliente.id), {
        id: cliente.id,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        documentoTipo: cliente.documento_tipo,
        documentoNumero: cliente.documento_numero,
        telefono: cliente.telefono,
        email: cliente.email,
        direccion: cliente.direccion,
        ciudad: cliente.ciudad,
        tipo: cliente.tipo,
        activo: cliente.activo,
        createdBy: cliente.created_by,
        createdAt: Timestamp.fromDate(new Date(cliente.created_at)),
        updatedAt: Timestamp.fromDate(new Date(cliente.updated_at))
      });
    }

    return data.length;
  }

  private async migrateCaballos(): Promise<number> {
    const { data, error } = await this.supabaseService.client
      .from('caballos')
      .select('*');

    if (error) throw error;

    for (const caballo of data) {
      await setDoc(doc(db, 'caballos', caballo.id), {
        id: caballo.id,
        nombre: caballo.nombre,
        nombreCriadero: caballo.nombre_criadero,
        fechaNacimiento: caballo.fecha_nacimiento,
        sexo: caballo.sexo,
        raza: caballo.raza,
        pelaje: caballo.pelaje,
        padreId: caballo.padre_id,
        madreId: caballo.madre_id,
        propietarioActualId: caballo.propietario_actual_id,
        criaderoId: caballo.criadero_id,
        estado: caballo.estado,
        observaciones: caballo.observaciones,
        fotoUrl: caballo.foto_url,
        createdBy: caballo.created_by,
        createdAt: Timestamp.fromDate(new Date(caballo.created_at)),
        updatedAt: Timestamp.fromDate(new Date(caballo.updated_at))
      });
    }

    return data.length;
  }

  private async migrateProveedores(): Promise<number> {
    const { data, error } = await this.supabaseService.client
      .from('proveedores')
      .select('*');

    if (error) throw error;

    for (const proveedor of data) {
      await setDoc(doc(db, 'proveedores', proveedor.id), {
        id: proveedor.id,
        nombre: proveedor.nombre,
        contacto: proveedor.contacto,
        telefono: proveedor.telefono,
        email: proveedor.email,
        direccion: proveedor.direccion,
        tipo: proveedor.tipo,
        activo: proveedor.activo,
        createdBy: proveedor.created_by,
        createdAt: Timestamp.fromDate(new Date(proveedor.created_at)),
        updatedAt: Timestamp.fromDate(new Date(proveedor.updated_at))
      });
    }

    return data.length;
  }

  private async migrateServicios(): Promise<number> {
    const { data, error } = await this.supabaseService.client
      .from('servicios')
      .select('*');

    if (error) throw error;

    for (const servicio of data) {
      await setDoc(doc(db, 'servicios', servicio.id), {
        id: servicio.id,
        caballoId: servicio.caballo_id,
        tipoServicio: servicio.tipo_servicio,
        descripcion: servicio.descripcion,
        costo: servicio.costo * 100, // Convertir a centavos
        fechaRealizacion: servicio.fecha_realizacion,
        proximaFecha: servicio.proxima_fecha,
        realizadoPor: servicio.realizado_por,
        createdBy: servicio.created_by,
        observaciones: servicio.observaciones,
        createdAt: Timestamp.fromDate(new Date(servicio.created_at)),
        updatedAt: Timestamp.fromDate(new Date(servicio.updated_at))
      });
    }

    return data.length;
  }

  private async migrateMontadores(): Promise<number> {
    const { data, error } = await this.supabaseService.client
      .from('montadores')
      .select('*');

    if (error) throw error;

    for (const montador of data) {
      await setDoc(doc(db, 'montadores', montador.id), {
        id: montador.id,
        nombre: montador.nombre,
        apellido: montador.apellido,
        especialidad: montador.especialidad,
        telefono: montador.telefono,
        email: montador.email,
        tarifaHora: montador.tarifa_hora * 100, // Convertir a centavos
        activo: montador.activo,
        createdBy: montador.created_by,
        createdAt: Timestamp.fromDate(new Date(montador.created_at)),
        updatedAt: Timestamp.fromDate(new Date(montador.updated_at))
      });
    }

    return data.length;
  }

  private async migrateHerrajes(): Promise<number> {
    const { data, error } = await this.supabaseService.client
      .from('herrajes')
      .select('*');

    if (error) throw error;

    for (const herraje of data) {
      await setDoc(doc(db, 'herrajes', herraje.id), {
        id: herraje.id,
        nombre: herraje.nombre,
        tipo: herraje.tipo,
        descripcion: herraje.descripcion,
        precioUnitario: herraje.precio_unitario * 100, // Convertir a centavos
        stockActual: herraje.stock_actual,
        stockMinimo: herraje.stock_minimo,
        proveedorId: herraje.proveedor_id,
        activo: herraje.activo,
        createdBy: herraje.created_by,
        createdAt: Timestamp.fromDate(new Date(herraje.created_at)),
        updatedAt: Timestamp.fromDate(new Date(herraje.updated_at))
      });
    }

    return data.length;
  }

  private async migrateTransacciones(): Promise<number> {
    const { data, error } = await this.supabaseService.client
      .from('transacciones')
      .select('*');

    if (error) throw error;

    for (const transaccion of data) {
      await setDoc(doc(db, 'finanzas', transaccion.id), {
        id: transaccion.id,
        tipo: transaccion.tipo,
        categoria: transaccion.categoria,
        descripcion: transaccion.descripcion,
        monto: transaccion.monto * 100, // Convertir a centavos
        fecha: transaccion.fecha,
        caballoId: transaccion.caballo_id,
        clienteId: transaccion.cliente_id,
        usuarioId: transaccion.usuario_id,
        metodoPago: transaccion.metodo_pago,
        comprobanteUrl: transaccion.comprobante_url,
        createdAt: Timestamp.fromDate(new Date(transaccion.created_at)),
        updatedAt: Timestamp.fromDate(new Date(transaccion.updated_at))
      });
    }

    return data.length;
  }

  private async migrateInventario(): Promise<number> {
    const { data, error } = await this.supabaseService.client
      .from('inventario')
      .select('*');

    if (error) throw error;

    for (const item of data) {
      await setDoc(doc(db, 'inventario', item.id), {
        id: item.id,
        nombre: item.nombre,
        descripcion: item.descripcion,
        categoria: item.categoria,
        unidadMedida: item.unidad_medida,
        stockActual: item.stock_actual,
        stockMinimo: item.stock_minimo,
        precioUnitario: item.precio_unitario * 100, // Convertir a centavos
        proveedorId: item.proveedor_id,
        fechaVencimiento: item.fecha_vencimiento,
        ubicacion: item.ubicacion,
        activo: item.activo,
        createdBy: item.created_by,
        createdAt: Timestamp.fromDate(new Date(item.created_at)),
        updatedAt: Timestamp.fromDate(new Date(item.updated_at))
      });
    }

    return data.length;
  }

  private async migrateMovimientosInventario(): Promise<number> {
    const { data, error } = await this.supabaseService.client
      .from('movimientos_inventario')
      .select('*');

    if (error) throw error;

    for (const movimiento of data) {
      await setDoc(doc(db, 'movimientos_inventario', movimiento.id), {
        id: movimiento.id,
        inventarioId: movimiento.inventario_id,
        tipo: movimiento.tipo,
        cantidad: movimiento.cantidad,
        motivo: movimiento.motivo,
        costoUnitario: movimiento.costo_unitario ? movimiento.costo_unitario * 100 : null,
        usuarioId: movimiento.usuario_id,
        fecha: movimiento.fecha,
        createdAt: Timestamp.fromDate(new Date(movimiento.created_at))
      });
    }

    return data.length;
  }

  private async migrateEventos(): Promise<number> {
    const { data, error } = await this.supabaseService.client
      .from('eventos')
      .select('*');

    if (error) throw error;

    for (const evento of data) {
      await setDoc(doc(db, 'eventos', evento.id), {
        id: evento.id,
        titulo: evento.titulo,
        descripcion: evento.descripcion,
        tipo: evento.tipo,
        fechaInicio: Timestamp.fromDate(new Date(evento.fecha_inicio)),
        fechaFin: evento.fecha_fin ? Timestamp.fromDate(new Date(evento.fecha_fin)) : null,
        caballoId: evento.caballo_id,
        clienteId: evento.cliente_id,
        usuarioId: evento.usuario_id,
        createdBy: evento.created_by,
        estado: evento.estado,
        recordatorio: evento.recordatorio,
        minutosRecordatorio: evento.minutos_recordatorio,
        ubicacion: evento.ubicacion,
        notas: evento.notas,
        recurrente: evento.recurrente,
        frecuencia: evento.frecuencia,
        fechaFinRecurrencia: evento.fecha_fin_recurrencia,
        createdAt: Timestamp.fromDate(new Date(evento.created_at)),
        updatedAt: Timestamp.fromDate(new Date(evento.updated_at))
      });
    }

    return data.length;
  }

  private async migrateNotificaciones(): Promise<number> {
    const { data, error } = await this.supabaseService.client
      .from('notificaciones')
      .select('*');

    if (error) throw error;

    for (const notificacion of data) {
      await setDoc(doc(db, 'notificaciones', notificacion.id), {
        id: notificacion.id,
        usuarioId: notificacion.usuario_id,
        titulo: notificacion.titulo,
        mensaje: notificacion.mensaje,
        tipo: notificacion.tipo,
        leida: notificacion.leida,
        eventoId: notificacion.evento_id,
        createdAt: Timestamp.fromDate(new Date(notificacion.created_at))
      });
    }

    return data.length;
  }

  private async migrateHistorialCambios(): Promise<number> {
    const { data, error } = await this.supabaseService.client
      .from('historial_cambios')
      .select('*');

    if (error) throw error;

    for (const cambio of data) {
      await setDoc(doc(db, 'auditoria', cambio.id), {
        id: cambio.id,
        coleccion: cambio.tabla_afectada,
        documentoId: cambio.registro_id,
        accion: cambio.accion,
        datosAnteriores: cambio.datos_anteriores,
        datosNuevos: cambio.datos_nuevos,
        usuarioId: cambio.usuario_id,
        fecha: Timestamp.fromDate(new Date(cambio.fecha))
      });
    }

    return data.length;
  }
}