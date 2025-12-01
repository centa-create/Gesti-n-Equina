import { Injectable } from '@angular/core';
import { Herraje, ServicioHerraje } from '../models/herraje';

@Injectable({ providedIn: 'root' })
export class HerrajesService {
  private herrajes: Herraje[] = [
    {
      id: 1,
      nombre: 'Herradura estándar',
      tipo: 'herradura',
      descripcion: 'Herradura de acero para caballos adultos',
      precio: 25000,
      stock: 50,
      proveedor: 'Ferretería Equina',
      fechaCompra: '2024-01-10T00:00:00.000Z'
    },
    {
      id: 2,
      nombre: 'Clavos de herradura',
      tipo: 'clavo',
      descripcion: 'Paquete de 100 clavos',
      precio: 15000,
      stock: 20,
      proveedor: 'Ferretería Equina',
      fechaCompra: '2024-01-10T00:00:00.000Z'
    }
  ];

  private servicios: ServicioHerraje[] = [];

  getHerrajes(): Herraje[] {
    return this.herrajes;
  }

  addHerraje(herraje: Omit<Herraje, 'id'>): void {
    const newHerraje: Herraje = {
      ...herraje,
      id: this.herrajes.length + 1
    };
    this.herrajes.push(newHerraje);
  }

  updateHerraje(id: number, data: Partial<Herraje>): void {
    const index = this.herrajes.findIndex(h => h.id === id);
    if (index > -1) {
      this.herrajes[index] = { ...this.herrajes[index], ...data };
    }
  }

  deleteHerraje(id: number): void {
    this.herrajes = this.herrajes.filter(h => h.id !== id);
  }

  getServiciosByHerrador(herradorId: number): ServicioHerraje[] {
    return this.servicios.filter(s => s.herradorId === herradorId);
  }

  addServicio(servicio: Omit<ServicioHerraje, 'id'>): void {
    const newServicio: ServicioHerraje = {
      ...servicio,
      id: this.servicios.length + 1
    };
    this.servicios.push(newServicio);
  }
}