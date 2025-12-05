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
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
  QuerySnapshot
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor() { }

  // ===============================
  // MÉTODOS GENÉRICOS DE FIRESTORE
  // ===============================

  /**
   * Obtener un documento por ID
   */
  async getDocument(collectionName: string, docId: string): Promise<any> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error getting document ${docId} from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Obtener todos los documentos de una colección
   */
  async getCollection(collectionName: string): Promise<any[]> {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error getting collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo documento
   */
  async createDocument(collectionName: string, data: any, docId?: string): Promise<string> {
    try {
      const docRef = docId ? doc(db, collectionName, docId) : doc(collection(db, collectionName));
      await setDoc(docRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar un documento
   */
  async updateDocument(collectionName: string, docId: string, data: any): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error(`Error updating document ${docId} in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un documento
   */
  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, collectionName, docId));
    } catch (error) {
      console.error(`Error deleting document ${docId} in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Consultar documentos con filtros
   */
  async queryDocuments(
    collectionName: string,
    filters: { field: string; operator: any; value: any }[] = [],
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'asc',
    limitCount?: number
  ): Promise<any[]> {
    try {
      console.log(`FirebaseService: Querying ${collectionName} with filters:`, filters);

      const collectionRef = collection(db, collectionName);
      let queryConstraints: any[] = [];

      // Aplicar filtros
      filters.forEach(filter => {
        queryConstraints.push(where(filter.field, filter.operator, filter.value));
      });

      // Aplicar ordenamiento
      if (orderByField) {
        queryConstraints.push(orderBy(orderByField, orderDirection));
      }

      // Aplicar límite
      if (limitCount) {
        queryConstraints.push(limit(limitCount));
      }

      const q = query(collectionRef, ...queryConstraints);

      // Agregar timeout para evitar consultas que cuelgan
      const queryPromise = getDocs(q);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Query timeout for ${collectionName}`)), 10000)
      );

      const querySnapshot = await Promise.race([queryPromise, timeoutPromise]) as any;
      const results = querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

      console.log(`FirebaseService: Query ${collectionName} returned ${results.length} documents`);
      return results;
    } catch (error) {
      console.error(`FirebaseService: Error querying ${collectionName}:`, error);
      throw error;
    }
  }

  // ===============================
  // MÉTODOS ESPECÍFICOS DEL PROYECTO
  // ===============================

  /**
   * Obtener roles (no requiere autenticación según reglas)
   */
  async getRoles(): Promise<any[]> {
    try {
      return await this.getCollection('roles');
    } catch (error) {
      console.warn('No se pudieron obtener roles (posiblemente usuario no autenticado):', error);
      return []; // Retornar array vacío si no hay permisos
    }
  }

  /**
   * Obtener perfil de usuario
   */
  async getUserProfile(userId: string): Promise<any> {
    return this.getDocument('users', userId);
  }

  /**
   * Obtener criaderos
   */
  async getCriaderos(): Promise<any[]> {
    const criaderos = await this.getCollection('criaderos');
    return criaderos
      .filter(c => c.activo === true)
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  /**
   * Obtener caballos
   */
  async getCaballos(criaderoId?: string): Promise<any[]> {
    const filters = criaderoId ?
      [{ field: 'criaderoId', operator: '==', value: criaderoId }] : [];
    return this.queryDocuments('caballos', filters, 'nombre');
  }

  /**
   * Obtener servicios de un caballo
   */
  async getServiciosCaballo(caballoId: string): Promise<any[]> {
    return this.queryDocuments('servicios', [
      { field: 'caballoId', operator: '==', value: caballoId }
    ], 'fechaRealizacion', 'desc');
  }

  /**
   * Obtener transacciones financieras
   */
  async getTransacciones(tipo?: 'ingreso' | 'egreso', limitCount = 50): Promise<any[]> {
    const filters = tipo ? [{ field: 'tipo', operator: '==', value: tipo }] : [];
    return this.queryDocuments('finanzas', filters, 'fecha', 'desc', limitCount);
  }

  /**
   * Obtener inventario
   */
  async getInventario(): Promise<any[]> {
    return this.queryDocuments('inventario', [
      { field: 'activo', operator: '==', value: true }
    ], 'nombre');
  }

  /**
   * Obtener eventos
   */
  async getEventos(fechaInicio?: Date, fechaFin?: Date): Promise<any[]> {
    let filters: { field: string; operator: any; value: any }[] = [];

    if (fechaInicio) {
      filters.push({ field: 'fechaInicio', operator: '>=', value: Timestamp.fromDate(fechaInicio) });
    }
    if (fechaFin) {
      filters.push({ field: 'fechaFin', operator: '<=', value: Timestamp.fromDate(fechaFin) });
    }

    return this.queryDocuments('eventos', filters, 'fechaInicio');
  }

  /**
   * Obtener notificaciones de usuario
   */
  async getNotificacionesUsuario(userId: string, soloNoLeidas = false): Promise<any[]> {
    const filters: { field: string; operator: any; value: any }[] = [
      { field: 'usuarioId', operator: '==', value: userId }
    ];

    if (soloNoLeidas) {
      filters.push({ field: 'leida', operator: '==', value: false });
    }

    return this.queryDocuments('notificaciones', filters, 'createdAt', 'desc');
  }

  // ===============================
  // MÉTODOS DE ESTADÍSTICAS
  // ===============================

  /**
   * Obtener estadísticas generales
   */
  async getEstadisticasGenerales(): Promise<any> {
    try {
      const [
        caballos,
        criaderos,
        servicios,
        transacciones
      ] = await Promise.all([
        this.getCollection('caballos'),
        this.getCollection('criaderos'),
        this.getCollection('servicios'),
        this.getCollection('finanzas')
      ]);

      const caballosActivos = caballos.filter(c => c.estado === 'activo').length;
      const criaderosActivos = criaderos.filter(c => c.activo).length;
      const serviciosEsteMes = servicios.filter(s => {
        let fecha: Date;
        if (s.fechaRealizacion instanceof Date) {
          fecha = s.fechaRealizacion;
        } else if (s.fechaRealizacion && typeof s.fechaRealizacion === 'object' && 'toDate' in s.fechaRealizacion) {
          // Firestore Timestamp
          fecha = s.fechaRealizacion.toDate();
        } else if (typeof s.fechaRealizacion === 'string') {
          // String date
          fecha = new Date(s.fechaRealizacion);
        } else {
          return false; // Invalid date
        }

        const ahora = new Date();
        return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
      }).length;

      const ingresosTotales = transacciones
        .filter(t => t.tipo === 'ingreso')
        .reduce((sum, t) => sum + (t.monto / 100), 0); // Convertir de centavos

      return {
        caballosActivos,
        criaderosActivos,
        serviciosEsteMes,
        ingresosTotales
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw error;
    }
  }

  // ===============================
  // MÉTODOS DE BÚSQUEDA
  // ===============================

  /**
   * Buscar caballos por nombre
   */
  async buscarCaballos(termino: string): Promise<any[]> {
    // Firestore no tiene búsqueda de texto completo nativa
    // Esta es una implementación básica
    const caballos = await this.getCaballos();
    return caballos.filter(caballo =>
      caballo.nombre.toLowerCase().includes(termino.toLowerCase()) ||
      (caballo.nombreCriadero && caballo.nombreCriadero.toLowerCase().includes(termino.toLowerCase()))
    );
  }

  /**
   * Buscar clientes por nombre o documento
   */
  async buscarClientes(termino: string): Promise<any[]> {
    const clientes = await this.getCollection('clientes');
    return clientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(termino.toLowerCase()) ||
      cliente.apellido?.toLowerCase().includes(termino.toLowerCase()) ||
      cliente.documentoNumero?.includes(termino)
    );
  }
}