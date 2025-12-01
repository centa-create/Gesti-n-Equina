import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private notificaciones: any[] = [];
  private notificacionesSubject = new BehaviorSubject<any[]>([]);

  notificaciones$ = this.notificacionesSubject.asObservable();

  agregarNotificacion(mensaje: string, tipo: string = 'info') {
    const nueva = { id: Date.now(), mensaje, tipo };
    this.notificaciones.push(nueva);
    this.notificacionesSubject.next(this.notificaciones);
  }

  eliminarNotificacion(id: number) {
    this.notificaciones = this.notificaciones.filter(n => n.id !== id);
    this.notificacionesSubject.next(this.notificaciones);
  }

  // Aliases para compatibilidad con llamadas existentes
  agregar(mensaje: string, tipo: string = 'info') {
    this.agregarNotificacion(mensaje, tipo);
  }

  eliminar(id: number) {
    this.eliminarNotificacion(id);
  }
}