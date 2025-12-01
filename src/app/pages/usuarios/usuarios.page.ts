import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FirebaseService } from '../../services/firebase.service';
import { AuthService } from '../../services/auth.service';

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  role_id: number;
  activo: boolean;
}

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class UsuariosPage implements OnInit {
  usuarios: Usuario[] = [];
  loading = false;
  userRole: string | null = null;
  canEdit: boolean = false;

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private toastController: ToastController
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
}