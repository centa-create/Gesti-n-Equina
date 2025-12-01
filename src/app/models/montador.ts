export interface Montador {
  id: number;
  nombre: string;
  apellido: string;
  especialidad: 'jinete' | 'entrenador' | 'herrador' | 'veterinario' | 'otro';
  telefono?: string;
  email?: string;
  experienciaAnios?: number;
  tarifaHora?: number;
  disponibilidad: 'disponible' | 'ocupado' | 'inactivo';
  notas?: string;
  fechaRegistro: string; // ISO
}

export interface ServicioMontador {
  id: number;
  caballoId: number;
  montadorId: number;
  fecha: string; // ISO
  tipoServicio: 'entrenamiento' | 'competencia' | 'herraje' | 'revision_veterinaria' | 'otro';
  duracionHoras?: number;
  costo?: number;
  resultado?: string;
  notas?: string;
}