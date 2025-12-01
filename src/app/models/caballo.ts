export interface Caballo {
  id: number;
  nombre: string;
  criaderoId: number;
  raza?: string;
  edad?: number;
  sexo: 'macho' | 'hembra';
  color?: string;
  fechaNacimiento?: string; // ISO
  padreId?: number;
  madreId?: number;
  descripcion?: string;
  estadoSalud?: 'saludable' | 'enfermo' | 'lesionado';
  peso?: number; // en kg
  altura?: number; // en cm
  propietario?: string;
  entrenador?: string;
  competiciones?: number; // cantidad de competiciones
  victorias?: number;
  ultimaRevision?: string; // ISO
  notas?: string;
}

export interface HistorialMedico {
  id: number;
  caballoId: number;
  fecha: string; // ISO
  tipo: 'vacuna' | 'enfermedad' | 'tratamiento' | 'revision' | 'lesion';
  descripcion: string;
  veterinario?: string;
  costo?: number;
  notas?: string;
}

export interface Competencia {
  id: number;
  nombre: string;
  fecha: string; // ISO
  ubicacion?: string;
  caballoId: number;
  resultado?: 'ganador' | 'segundo' | 'tercero' | 'participante';
  premio?: number;
  notas?: string;
}