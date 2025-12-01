export interface Transaccion {
  id: number;
  criaderoId: number;
  tipo: 'ingreso' | 'gasto';
  categoria: string;
  descripcion: string;
  monto: number;
  fecha: string; // ISO
  caballoId?: number; // opcional, si está relacionado con un caballo
  eventoId?: number; // opcional, si está relacionado con un evento
  proveedor?: string;
  metodoPago?: 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque';
  comprobante?: string; // URL o referencia
  notas?: string;
  usuarioId?: number; // quien registró la transacción
}

export interface CategoriaFinanciera {
  id: string;
  nombre: string;
  tipo: 'ingreso' | 'gasto';
  descripcion?: string;
}

export interface ResumenFinanciero {
  totalIngresos: number;
  totalGastos: number;
  balance: number;
  ingresosPorCategoria: { [categoria: string]: number };
  gastosPorCategoria: { [categoria: string]: number };
  transaccionesRecientes: Transaccion[];
}