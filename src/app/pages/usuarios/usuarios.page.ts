import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: string;
  role_id: number;
  activo: boolean;
  createdAt?: any;
}

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuariosPage implements OnInit {
  usuarios: Usuario[] = [];
  loading = false;
  userRole: string | null = null;
  canEdit: boolean = false;
  showForm = false;
  nuevoUsuario: Partial<Usuario> = {};

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.userRole = this.authService.getRole();
    this.canEdit = this.userRole === 'admin';
    await this.cargarUsuarios();
  }

  async cargarUsuarios() {
    this.loading = true;
    try {
      // Obtener usuarios de Firebase
      const users = await this.firebaseService.getCollection('users');

      // Obtener roles para mapear
      const roles = await this.firebaseService.getRoles();
      const rolesMap = roles.reduce((acc: any, role: any) => {
        acc[role.id] = role.nombre;
        return acc;
      }, {});

      this.usuarios = users.map((user: any) => ({
        id: user.id,
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        rol: rolesMap[user.roleId] || 'visitante',
        role_id: user.roleId === 'admin' ? 1 : user.roleId === 'empleado' ? 2 : 3,
        activo: user.activo
      }));
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      this.presentToast('Error al cargar usuarios');
    } finally {
      this.loading = false;
    }
  }

  async cambiarRol(usuario: Usuario, nuevoRol: string) {
    if (!this.canEdit) return;

    try {
      // Mapear nombre de rol a ID
      const roleIdMap: { [key: string]: string } = {
        'admin': 'admin',
        'empleado': 'empleado',
        'visitante': 'visitante'
      };

      const roleId = roleIdMap[nuevoRol] || 'visitante';

      // Actualizar rol en Firebase
      await this.firebaseService.updateDocument('users', usuario.id, {
        roleId: roleId
      });

      usuario.rol = nuevoRol;
      usuario.role_id = roleId === 'admin' ? 1 : roleId === 'empleado' ? 2 : 3;
      this.presentToast(`Rol cambiado a ${nuevoRol}`);
    } catch (error) {
      console.error('Error cambiando rol:', error);
      this.presentToast('Error al cambiar rol');
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  // Métodos para el diseño profesional
  getRoleCount(role: string): number {
    return this.usuarios.filter(u => u.rol === role).length;
  }

  getRoleIcon(role: string): string {
    const icons: { [key: string]: string } = {
      'admin': 'shield-checkmark',
      'empleado': 'briefcase',
      'visitante': 'eye'
    };
    return icons[role] || 'person';
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      'admin': 'linear-gradient(135deg, #dc2626, #b91c1c)',
      'empleado': 'linear-gradient(135deg, #059669, #047857)',
      'visitante': 'linear-gradient(135deg, #7c3aed, #6d28d9)'
    };
    return colors[role] || 'linear-gradient(135deg, #6b7280, #4b5563)';
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.nuevoUsuario = {};
    }
    this.cdr.detectChanges();
  }

  editarUsuario(usuario: Usuario) {
    this.nuevoUsuario = { ...usuario };
    this.showForm = true;
    this.cdr.detectChanges();
  }

  async eliminarUsuario(usuario: Usuario) {
    if (!this.canEdit) return;

    const confirm = await this.toastController.create({
      message: `¿Estás seguro de eliminar al usuario ${usuario.nombre}?`,
      position: 'middle',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.firebaseService.deleteDocument('users', usuario.id);
              this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
              this.presentToast('Usuario eliminado correctamente');
              this.cdr.detectChanges();
            } catch (error) {
              console.error('Error eliminando usuario:', error);
              this.presentToast('Error al eliminar usuario');
            }
          }
        }
      ]
    });
    await confirm.present();
  }

  async guardarUsuario() {
    if (!this.canEdit) return;

    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.email || !this.nuevoUsuario.rol) {
      this.presentToast('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      const userData = {
        nombre: this.nuevoUsuario.nombre,
        apellido: this.nuevoUsuario.apellido || '',
        email: this.nuevoUsuario.email,
        telefono: this.nuevoUsuario.telefono || '',
        roleId: this.nuevoUsuario.rol,
        activo: true,
        createdAt: new Date()
      };

      if (this.nuevoUsuario.id) {
        // Actualizar usuario existente
        await this.firebaseService.updateDocument('users', this.nuevoUsuario.id, userData);
        const index = this.usuarios.findIndex(u => u.id === this.nuevoUsuario.id);
        if (index !== -1) {
          this.usuarios[index] = { ...this.usuarios[index], ...this.nuevoUsuario };
        }
        this.presentToast('Usuario actualizado correctamente');
      } else {
        // Crear nuevo usuario
        const docId = await this.firebaseService.createDocument('users', userData);
        const newUser: Usuario = {
          id: docId,
          nombre: this.nuevoUsuario.nombre!,
          apellido: this.nuevoUsuario.apellido || '',
          email: this.nuevoUsuario.email!,
          telefono: this.nuevoUsuario.telefono,
          rol: this.nuevoUsuario.rol!,
          role_id: this.nuevoUsuario.rol === 'admin' ? 1 : this.nuevoUsuario.rol === 'empleado' ? 2 : 3,
          activo: true,
          createdAt: userData.createdAt
        };
        this.usuarios.push(newUser);
        this.presentToast('Usuario creado correctamente');
      }

      this.toggleForm();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error guardando usuario:', error);
      this.presentToast('Error al guardar usuario');
    }
  }

  canDeleteUser(usuario: Usuario): boolean {
    if (usuario.rol !== 'admin') return true;
    return this.usuarios.filter(u => u.rol === 'admin').length > 1;
  }

  async refreshUsuarios() {
    await this.cargarUsuarios();
  }
}