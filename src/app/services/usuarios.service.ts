import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  id?: number;
  nombre: string;
  usuario: string;
  correo: string;
  role: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(private http: HttpClient) { }

  /**
   * Obtener lista de todos los usuarios
   */
  obtenerUsuarios(): Observable<Usuario[]> {
    const url = `${environment.apiUrl}/api/users`;
    return this.http.get<Usuario[]>(url).pipe(
      catchError((error) => {
        console.error('Error obteniendo usuarios:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtener un usuario por ID
   */
  obtenerUsuario(id: number): Observable<Usuario | null> {
    const url = `${environment.apiUrl}/api/users/${id}`;
    return this.http.get<Usuario>(url).pipe(
      catchError((error) => {
        console.error('Error obteniendo usuario:', error);
        return of(null);
      })
    );
  }

  /**
   * Actualizar rol de un usuario
   */
  actualizarUsuario(id: number, datos: Partial<Usuario>): Observable<any> {
    const url = `${environment.apiUrl}/api/users/${id}`;
    return this.http.put(url, datos).pipe(
      catchError((error) => {
        console.error('Error actualizando usuario:', error);
        return of(null);
      })
    );
  }

  /**
   * Eliminar un usuario
   */
  eliminarUsuario(id: number): Observable<any> {
    const url = `${environment.apiUrl}/api/users/${id}`;
    return this.http.delete(url).pipe(
      catchError((error) => {
        console.error('Error eliminando usuario:', error);
        return of(null);
      })
    );
  }
}