import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Caballo, HistorialMedico, Competencia } from '../models/caballo';

@Injectable({ providedIn: 'root' })
export class CaballosService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Mantener datos locales como fallback
  private caballos: Caballo[] = [
    {
      id: 1,
      nombre: 'Relámpago',
      criaderoId: 1,
      raza: 'Pura Sangre',
      edad: 5,
      sexo: 'macho',
      color: 'Bayo',
      fechaNacimiento: '2019-03-15T00:00:00.000Z',
      padreId: undefined,
      madreId: undefined,
      estadoSalud: 'saludable',
      peso: 450,
      altura: 160,
      propietario: 'Juan Pérez',
      entrenador: 'María García',
      competiciones: 12,
      victorias: 8,
      ultimaRevision: '2024-10-01T00:00:00.000Z'
    },
    {
      id: 2,
      nombre: 'Estrella',
      criaderoId: 2,
      raza: 'Árabe',
      edad: 3,
      sexo: 'hembra',
      color: 'Blanco',
      fechaNacimiento: '2021-07-20T00:00:00.000Z',
      padreId: 1,
      madreId: undefined,
      estadoSalud: 'saludable',
      peso: 380,
      altura: 150,
      propietario: 'Ana López',
      entrenador: 'Carlos Ruiz',
      competiciones: 5,
      victorias: 3,
      ultimaRevision: '2024-09-15T00:00:00.000Z'
    },
    {
      id: 3,
      nombre: 'Centella',
      criaderoId: 1,
      raza: 'Pura Sangre',
      edad: 7,
      sexo: 'hembra',
      color: 'Alazán',
      fechaNacimiento: '2017-05-10T00:00:00.000Z',
      padreId: undefined,
      madreId: undefined,
      estadoSalud: 'lesionado',
      peso: 420,
      altura: 158,
      propietario: 'Pedro Gómez',
      entrenador: 'María García',
      competiciones: 25,
      victorias: 15,
      ultimaRevision: '2024-11-01T00:00:00.000Z'
    }
  ];

  private historialMedico: HistorialMedico[] = [
    {
      id: 1,
      caballoId: 3,
      fecha: '2024-11-01T00:00:00.000Z',
      tipo: 'lesion',
      descripcion: 'Lesión en pata trasera',
      veterinario: 'Dr. Silva',
      costo: 150000,
      notas: 'Requiere reposo de 2 semanas'
    }
  ];

  private competencias: Competencia[] = [
    {
      id: 1,
      nombre: 'Gran Premio Nacional',
      fecha: '2024-10-15T00:00:00.000Z',
      ubicacion: 'Hipódromo Nacional',
      caballoId: 1,
      resultado: 'ganador',
      premio: 5000000,
      notas: 'Excelente performance'
    }
  ];

  getCaballosByCriadero(criaderoId: number): Observable<Caballo[]> {
    return this.http.get<Caballo[]>(`${this.apiUrl}/caballos?criaderoId=${criaderoId}`);
  }

  addCaballo(caballo: Omit<Caballo, 'id'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/caballos`, caballo);
  }

  updateCaballo(id: number, data: any) {
    const index = this.caballos.findIndex(c => c.id === id);
    if (index > -1) {
      this.caballos[index] = { ...this.caballos[index], ...data };
    }
  }

  deleteCaballo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/caballos/${id}`);
  }

  // Genealogía
  getPadre(caballoId: number): Caballo | undefined {
    const caballo = this.caballos.find(c => c.id === caballoId);
    if (caballo?.padreId) {
      return this.caballos.find(c => c.id === caballo.padreId);
    }
    return undefined;
  }

  getMadre(caballoId: number): Caballo | undefined {
    const caballo = this.caballos.find(c => c.id === caballoId);
    if (caballo?.madreId) {
      return this.caballos.find(c => c.id === caballo.madreId);
    }
    return undefined;
  }

  getHermanos(caballoId: number): Caballo[] {
    const caballo = this.caballos.find(c => c.id === caballoId);
    if (!caballo) return [];
    return this.caballos.filter(c =>
      c.id !== caballoId &&
      ((c.padreId === caballo.padreId && c.padreId) || (c.madreId === caballo.madreId && c.madreId))
    );
  }

  // Historial Médico
  getHistorialMedico(caballoId: number): HistorialMedico[] {
    return this.historialMedico.filter(h => h.caballoId === caballoId);
  }

  addHistorialMedico(historial: Omit<HistorialMedico, 'id'>): void {
    const newHistorial: HistorialMedico = {
      ...historial,
      id: this.historialMedico.length + 1
    };
    this.historialMedico.push(newHistorial);
  }

  // Competiciones
  getCompeticiones(caballoId: number): Competencia[] {
    return this.competencias.filter(c => c.caballoId === caballoId);
  }

  addCompetencia(competencia: Omit<Competencia, 'id'>): void {
    const newCompetencia: Competencia = {
      ...competencia,
      id: this.competencias.length + 1
    };
    this.competencias.push(newCompetencia);
  }
}