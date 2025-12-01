import { Injectable } from '@angular/core';
import { Montador, ServicioMontador } from '../models/montador';

@Injectable({ providedIn: 'root' })
export class MontadoresService {
  private montadores: Montador[] = [
    {
      id: 1,
      nombre: 'Juan',
      apellido: 'Pérez',
      especialidad: 'jinete',
      telefono: '3001234567',
      email: 'juan@example.com',
      experienciaAnios: 5,
      tarifaHora: 50000,
      disponibilidad: 'disponible',
      fechaRegistro: '2023-01-15T00:00:00.000Z'
    },
    {
      id: 2,
      nombre: 'María',
      apellido: 'García',
      especialidad: 'entrenador',
      telefono: '3019876543',
      email: 'maria@example.com',
      experienciaAnios: 8,
      tarifaHora: 75000,
      disponibilidad: 'ocupado',
      fechaRegistro: '2022-06-20T00:00:00.000Z'
    }
  ];

  private servicios: ServicioMontador[] = [];

  getMontadores(): Montador[] {
    return this.montadores;
  }

  addMontador(montador: Omit<Montador, 'id' | 'fechaRegistro'>): void {
    const newMontador: Montador = {
      ...montador,
      id: this.montadores.length + 1,
      fechaRegistro: new Date().toISOString()
    };
    this.montadores.push(newMontador);
  }

  updateMontador(id: number, data: Partial<Montador>): void {
    const index = this.montadores.findIndex(m => m.id === id);
    if (index > -1) {
      this.montadores[index] = { ...this.montadores[index], ...data };
    }
  }

  deleteMontador(id: number): void {
    this.montadores = this.montadores.filter(m => m.id !== id);
  }

  getServiciosByMontador(montadorId: number): ServicioMontador[] {
    return this.servicios.filter(s => s.montadorId === montadorId);
  }

  addServicio(servicio: Omit<ServicioMontador, 'id'>): void {
    const newServicio: ServicioMontador = {
      ...servicio,
      id: this.servicios.length + 1
    };
    this.servicios.push(newServicio);
  }
}