import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Transaccion, ResumenFinanciero, CategoriaFinanciera } from '../models/transaccion';

@Injectable({ providedIn: 'root' })
export class FinanzasService {
  private apiUrl = 'http://localhost:3000/api';

  categorias: CategoriaFinanciera[] = [
    // Ingresos
    { id: 'venta_caballos', nombre: 'Venta de Caballos', tipo: 'ingreso' },
    { id: 'premios_competiciones', nombre: 'Premios de Competiciones', tipo: 'ingreso' },
    { id: 'servicios_reproduccion', nombre: 'Servicios de Reproducción', tipo: 'ingreso' },
    { id: 'alquiler_instalaciones', nombre: 'Alquiler de Instalaciones', tipo: 'ingreso' },
    { id: 'venta_equipos', nombre: 'Venta de Equipos', tipo: 'ingreso' },
    { id: 'otros_ingresos', nombre: 'Otros Ingresos', tipo: 'ingreso' },

    // Gastos
    { id: 'alimento_caballos', nombre: 'Alimento para Caballos', tipo: 'gasto' },
    { id: 'veterinario', nombre: 'Servicios Veterinarios', tipo: 'gasto' },
    { id: 'herrajes', nombre: 'Herrajes y Herraduras', tipo: 'gasto' },
    { id: 'entrenamiento', nombre: 'Entrenamiento', tipo: 'gasto' },
    { id: 'competiciones', nombre: 'Inscripciones a Competiciones', tipo: 'gasto' },
    { id: 'mantenimiento', nombre: 'Mantenimiento de Instalaciones', tipo: 'gasto' },
    { id: 'salarios', nombre: 'Salarios y Honorarios', tipo: 'gasto' },
    { id: 'equipos', nombre: 'Compra de Equipos', tipo: 'gasto' },
    { id: 'transporte', nombre: 'Transporte', tipo: 'gasto' },
    { id: 'seguros', nombre: 'Seguros', tipo: 'gasto' },
    { id: 'otros_gastos', nombre: 'Otros Gastos', tipo: 'gasto' }
  ];

  constructor(private http: HttpClient) {}

  // Transacciones
  getTransacciones(criaderoId?: number): Observable<Transaccion[]> {
    const params = criaderoId ? `?criaderoId=${criaderoId}` : '';
    return this.http.get<Transaccion[]>(`${this.apiUrl}/transacciones${params}`);
  }

  getTransaccion(id: number): Observable<Transaccion> {
    return this.http.get<Transaccion>(`${this.apiUrl}/transacciones/${id}`);
  }

  crearTransaccion(transaccion: Omit<Transaccion, 'id'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/transacciones`, transaccion);
  }

  actualizarTransaccion(id: number, transaccion: Partial<Transaccion>): Observable<any> {
    return this.http.put(`${this.apiUrl}/transacciones/${id}`, transaccion);
  }

  eliminarTransaccion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/transacciones/${id}`);
  }

  // Resumen financiero
  getResumenFinanciero(criaderoId: number, fechaInicio?: string, fechaFin?: string): Observable<ResumenFinanciero> {
    let params = `criaderoId=${criaderoId}`;
    if (fechaInicio) params += `&fechaInicio=${fechaInicio}`;
    if (fechaFin) params += `&fechaFin=${fechaFin}`;

    return this.http.get<Transaccion[]>(`${this.apiUrl}/transacciones?${params}`).pipe(
      map(transacciones => this.calcularResumen(transacciones))
    );
  }

  private calcularResumen(transacciones: Transaccion[]): ResumenFinanciero {
    const ingresos = transacciones.filter(t => t.tipo === 'ingreso');
    const gastos = transacciones.filter(t => t.tipo === 'gasto');

    const totalIngresos = ingresos.reduce((sum, t) => sum + t.monto, 0);
    const totalGastos = gastos.reduce((sum, t) => sum + t.monto, 0);

    const ingresosPorCategoria: { [categoria: string]: number } = {};
    const gastosPorCategoria: { [categoria: string]: number } = {};

    ingresos.forEach(t => {
      ingresosPorCategoria[t.categoria] = (ingresosPorCategoria[t.categoria] || 0) + t.monto;
    });

    gastos.forEach(t => {
      gastosPorCategoria[t.categoria] = (gastosPorCategoria[t.categoria] || 0) + t.monto;
    });

    // Últimas 10 transacciones
    const transaccionesRecientes = transacciones
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 10);

    return {
      totalIngresos,
      totalGastos,
      balance: totalIngresos - totalGastos,
      ingresosPorCategoria,
      gastosPorCategoria,
      transaccionesRecientes
    };
  }

  // Métodos legacy para compatibilidad
  getRegistrosByCriadero(criaderoId: number): any[] {
    // Este método debería ser reemplazado por getTransacciones
    return [];
  }

  addRegistro(registro: any) {
    // Legacy method - should be replaced
    console.warn('addRegistro is deprecated, use crearTransaccion instead');
  }

  updateRegistro(id: number, data: any) {
    // Legacy method - should be replaced
    console.warn('updateRegistro is deprecated, use actualizarTransaccion instead');
  }

  deleteRegistro(id: number) {
    // Legacy method - should be replaced
    console.warn('deleteRegistro is deprecated, use eliminarTransaccion instead');
  }
}