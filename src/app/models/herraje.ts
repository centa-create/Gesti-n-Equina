export interface Herraje {
  id: number;
  nombre: string;
  tipo: 'herradura' | 'clavo' | 'herramienta' | 'otro';
  descripcion?: string;
  precio?: number;
  stock: number;
  proveedor?: string;
  fechaCompra?: string; // ISO
  notas?: string;
}

export interface ServicioHerraje {
  id: number;
  caballoId: number;
  herradorId: number; // ID del montador/herrador
  fecha: string; // ISO
  tipoServicio: 'herraje_completo' | 'reherraje' | 'reparacion' | 'revision';
  costo?: number;
  notas?: string;
  proximoServicio?: string; // ISO
}