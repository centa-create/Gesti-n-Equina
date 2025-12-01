import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CriaderoActivoService } from '../../services/criadero-activo.service';
import { FinanzasService } from '../../services/finanzas.service';
import { Transaccion, ResumenFinanciero, CategoriaFinanciera } from '../../models/transaccion';

@Component({
  selector: 'app-finanzas',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './finanzas.page.html',
  styleUrls: ['./finanzas.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinanzasPage implements OnInit {
  criaderoActivo: any = null;
  transacciones: Transaccion[] = [];
  resumen: ResumenFinanciero | null = null;
  categorias: CategoriaFinanciera[] = [];
  nuevaTransaccion: Partial<Transaccion> = {
    tipo: 'gasto',
    fecha: new Date().toISOString().split('T')[0] + 'T12:00:00.000Z'
  };

  isLoading = false;
  showForm = false;
  filtroTipo: 'todos' | 'ingreso' | 'gasto' = 'todos';
  filtroCategoria = '';

  constructor(
    private criaderoService: CriaderoActivoService,
    private finanzasService: FinanzasService
  ) {}

  ngOnInit() {
    this.categorias = this.finanzasService.categorias;

    this.criaderoService.criaderoActivo$.subscribe(c => {
      this.criaderoActivo = c;
      if (c) {
        this.cargarDatos();
      }
    });
  }

  cargarDatos() {
    if (!this.criaderoActivo) return;

    this.isLoading = true;

    // Cargar transacciones
    this.finanzasService.getTransacciones(this.criaderoActivo.id).subscribe({
      next: (transacciones) => {
        this.transacciones = transacciones;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando transacciones:', err);
        this.isLoading = false;
      }
    });

    // Cargar resumen financiero
    this.finanzasService.getResumenFinanciero(this.criaderoActivo.id).subscribe({
      next: (resumen) => {
        this.resumen = resumen;
      },
      error: (err) => {
        console.error('Error cargando resumen:', err);
      }
    });
  }

  get transaccionesFiltradas(): Transaccion[] {
    return this.transacciones.filter(t => {
      const tipoMatch = this.filtroTipo === 'todos' || t.tipo === this.filtroTipo;
      const categoriaMatch = !this.filtroCategoria || t.categoria === this.filtroCategoria;
      return tipoMatch && categoriaMatch;
    }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  crearTransaccion() {
    if (!this.nuevaTransaccion.descripcion || !this.nuevaTransaccion.monto ||
        !this.nuevaTransaccion.tipo || !this.nuevaTransaccion.categoria ||
        !this.criaderoActivo) {
      return;
    }

    const transaccion: Omit<Transaccion, 'id'> = {
      criaderoId: this.criaderoActivo.id,
      tipo: this.nuevaTransaccion.tipo,
      categoria: this.nuevaTransaccion.categoria,
      descripcion: this.nuevaTransaccion.descripcion,
      monto: this.nuevaTransaccion.monto,
      fecha: this.nuevaTransaccion.fecha || new Date().toISOString(),
      caballoId: this.nuevaTransaccion.caballoId,
      eventoId: this.nuevaTransaccion.eventoId,
      proveedor: this.nuevaTransaccion.proveedor,
      metodoPago: this.nuevaTransaccion.metodoPago,
      notas: this.nuevaTransaccion.notas
    };

    this.isLoading = true;
    this.finanzasService.crearTransaccion(transaccion).subscribe({
      next: () => {
        this.cargarDatos();
        this.nuevaTransaccion = {
          tipo: 'gasto',
          fecha: new Date().toISOString().split('T')[0] + 'T12:00:00.000Z'
        };
        this.showForm = false;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error creando transacción:', err);
        this.isLoading = false;
      }
    });
  }

  eliminarTransaccion(id: number) {
    if (confirm('¿Está seguro de eliminar esta transacción?')) {
      this.isLoading = true;
      this.finanzasService.eliminarTransaccion(id).subscribe({
        next: () => {
          this.cargarDatos();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error eliminando transacción:', err);
          this.isLoading = false;
        }
      });
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  getCategoriaNombre(categoriaId: string): string {
    const categoria = this.categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nombre : categoriaId;
  }

  getTipoColor(tipo: string): string {
    return tipo === 'ingreso' ? 'success' : 'danger';
  }

  formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(monto);
  }

  // Métodos legacy para compatibilidad
  agregarRegistro(descripcion: string | number | null | undefined, monto: string | number | null | undefined) {
    // Legacy method - replaced by crearTransaccion
    console.warn('agregarRegistro is deprecated');
  }

  eliminarRegistro(id: number) {
    // Legacy method - replaced by eliminarTransaccion
    this.eliminarTransaccion(id);
  }
}