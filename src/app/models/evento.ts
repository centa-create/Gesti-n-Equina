export interface Evento {
  id: number;
  nombre: string;
  fecha: string; // ISO
  criaderoId: number;
  descripcion?: string;
  tipo: 'competencia' | 'entrenamiento' | 'revision' | 'venta' | 'otro';
  ubicacion?: string;
  participantes?: number[]; // IDs de caballos
  costo?: number;
  duracionHoras?: number;
  responsable?: string;
  notas?: string;
  estado: 'programado' | 'en_curso' | 'completado' | 'cancelado';
}
