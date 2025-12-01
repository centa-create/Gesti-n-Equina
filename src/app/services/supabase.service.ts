import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    // Limpiar posibles locks antiguos al inicializar
    this.clearOldLocks();

    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'supabase.auth.token'
      }
    });
  }

  private clearOldLocks() {
    // Limpiar cualquier lock antiguo que pueda estar causando problemas
    try {
      if ('locks' in navigator) {
        // Intentar liberar locks relacionados con Supabase
        const lockNames = ['lock:sb-narjklfsatkmlntlmhi-auth-token'];
        lockNames.forEach(name => {
          navigator.locks.request(name, { ifAvailable: true }, () => {
            // Lock adquirido y liberado inmediatamente
            return Promise.resolve();
          }).catch(() => {
            // Ignorar errores de lock
          });
        });
      }
    } catch (error) {
      // Ignorar errores en navegadores que no soportan locks
    }
  }

  // Getter para acceder al cliente Supabase
  get client(): SupabaseClient {
    return this.supabase;
  }

  // Método para obtener la sesión actual
  async getCurrentSession() {
    try {
      return await this.supabase.auth.getSession();
    } catch (error) {
      console.warn('Error getting session, clearing cache:', error);
      // Limpiar cache corrupto
      localStorage.removeItem('supabase.auth.token');
      return { data: { session: null }, error: null };
    }
  }

  // Método para obtener el usuario actual
  getCurrentUser() {
    return this.supabase.auth.getUser();
  }

  // Método para cerrar sesión
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.warn('Error signing out:', error);
      // Forzar limpieza manual
      localStorage.removeItem('supabase.auth.token');
    }
  }

  // Método para probar la conexión con la base de datos
  async testConnection() {
    try {
      const { data, error } = await this.supabase.from('roles').select('*');
      if (error) {
        console.error('Error de conexión:', error);
        return { success: false, message: `Error de conexión: ${error.message}`, data: null };
      }
      console.log('Conexión exitosa, datos de roles:', data);
      return {
        success: true,
        message: `✅ Conexión exitosa - ${data.length} roles encontrados`,
        data
      };
    } catch (error) {
      console.error('Error inesperado:', error);
      return { success: false, message: 'Error inesperado en la conexión', data: null };
    }
  }
}