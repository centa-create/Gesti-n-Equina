import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-herrajes',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './herrajes.page.html',
  styleUrls: ['./herrajes.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HerrajesPage implements OnInit {
  userRole: string | null = null;
  canEdit: boolean = false;
  herrajes: any[] = [];
  proveedores: any[] = [];
  nuevoHerraje: any = {
    nombre: '',
    tipo: '',
    descripcion: '',
    precioUnitario: 0,
    stockActual: 0,
    stockMinimo: 0,
    proveedorId: '',
    activo: true
  };
  showForm: boolean = false;

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.userRole = this.authService.getRole();
    this.canEdit = this.userRole === 'admin';
    await this.cargarHerrajes();
    await this.cargarProveedores();
  }

  async cargarHerrajes() {
    try {
      this.herrajes = await this.firebaseService.getCollection('herrajes');
    } catch (error) {
      console.error('Error cargando herrajes:', error);
    }
  }

  async cargarProveedores() {
    try {
      this.proveedores = await this.firebaseService.getCollection('proveedores');
    } catch (error) {
      console.error('Error cargando proveedores:', error);
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  editarHerraje(herraje: any) {
    if (!this.canEdit) return;
    this.nuevoHerraje = { ...herraje, precioUnitario: herraje.precioUnitario / 100 }; // Convertir de centavos
    this.showForm = true;
  }

  async agregarHerraje() {
    if (!this.canEdit) return;

    if (!this.nuevoHerraje.nombre || !this.nuevoHerraje.tipo) {
      alert('Nombre y tipo son obligatorios');
      return;
    }

    try {
      const herrajeData = {
        ...this.nuevoHerraje,
        precioUnitario: this.nuevoHerraje.precioUnitario * 100, // Convertir a centavos
        createdBy: this.authService.getCurrentUser()?.id
      };

      if (this.nuevoHerraje.id) {
        // Update existing
        await this.firebaseService.updateDocument('herrajes', this.nuevoHerraje.id, herrajeData);
      } else {
        // Create new
        await this.firebaseService.createDocument('herrajes', herrajeData);
      }
      await this.cargarHerrajes();
      this.resetForm();
      this.showForm = false;
    } catch (error) {
      console.error('Error guardando herraje:', error);
      alert('Error al guardar el herraje');
    }
  }

  async eliminarHerraje(herrajeId: string) {
    if (!this.canEdit) return;

    if (confirm('¿Estás seguro de eliminar este herraje?')) {
      try {
        await this.firebaseService.deleteDocument('herrajes', herrajeId);
        await this.cargarHerrajes();
      } catch (error) {
        console.error('Error eliminando herraje:', error);
        alert('Error al eliminar el herraje');
      }
    }
  }

  getProveedorNombre(proveedorId: string): string {
    const proveedor = this.proveedores.find(p => p.id === proveedorId);
    return proveedor ? proveedor.nombre : 'Sin proveedor';
  }

  formatPrecio(precio: number): string {
    return `$${(precio / 100).toFixed(2)}`;
  }

  private resetForm() {
    this.nuevoHerraje = {
      nombre: '',
      tipo: '',
      descripcion: '',
      precioUnitario: 0,
      stockActual: 0,
      stockMinimo: 0,
      proveedorId: '',
      activo: true
    };
  }
}
