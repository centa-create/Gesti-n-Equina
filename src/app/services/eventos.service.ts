import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Evento } from '../models/evento';
import { NotificacionesService } from './notificaciones.service';

@Injectable({ providedIn: 'root' })
export class EventosService {
  private apiUrl = 'http://localhost:3000/api';
  private eventos: Evento[] = [];
  private eventosSubject = new BehaviorSubject<Evento[]>([]);
  eventos$ = this.eventosSubject.asObservable();

  constructor(
    private http: HttpClient,
    private notificacionesService: NotificacionesService
  ) {}

  getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/eventos`);
  }

  getEventosByCriadero(criaderoId: number): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/eventos?criaderoId=${criaderoId}`);
  }

  agregarEvento(evento: Omit<Evento, 'id'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/eventos`, evento);
  }

  actualizarEvento(id: number, evento: Partial<Evento>): Observable<any> {
    return this.http.put(`${this.apiUrl}/eventos/${id}`, evento);
  }

  eliminarEvento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eventos/${id}`);
  }

  // Método legacy para compatibilidad
  agregarEventoLegacy(nombre: string, fecha: Date, criaderoId: number) {
    const nuevo: Omit<Evento, 'id'> = {
      nombre,
      fecha: fecha.toISOString(),
      criaderoId,
      tipo: 'otro',
      estado: 'programado'
    };

    this.agregarEvento(nuevo).subscribe({
      next: () => {
        // Generar notificación si el evento está próximo (ej. dentro de 3 días)
        const hoy = new Date();
        const diff = (fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);
        if (diff <= 3 && diff >= 0) {
          this.notificacionesService.agregar(`Evento próximo: ${nombre} el ${fecha.toLocaleDateString()}`);
        }
      },
      error: (err) => console.error('Error creando evento:', err)
    });
  }
}