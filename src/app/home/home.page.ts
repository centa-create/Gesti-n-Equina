import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { CriaderoActivoService } from '../services/criadero-activo.service';
import { NotificacionesService } from '../services/notificaciones.service';

interface DashboardItem {
  title: string;
  path: string;
  icon: string;
  roles: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage {
  criaderoActivo: any = null;
  role: string | null = null;
  notificaciones: any[] = [];

  // Definición de módulos con roles permitidos
  items: DashboardItem[] = [
    { title: 'Criaderos', path: '/criaderos', icon: 'business', roles: ['admin','empleado'] },
    { title: 'Caballos', path: '/caballos', icon: 'paw', roles: ['admin','empleado'] },
    { title: 'Servicios', path: '/servicios', icon: 'construct', roles: ['admin','empleado'] },
    { title: 'Finanzas', path: '/finanzas', icon: 'cash', roles: ['admin'] },
    { title: 'Inventario', path: '/inventario', icon: 'cube', roles: ['admin'] },
    { title: 'Clientes', path: '/clientes', icon: 'people', roles: ['admin','empleado'] },
    { title: 'Eventos', path: '/eventos', icon: 'calendar', roles: ['admin','empleado'] },
    { title: 'Reportes', path: '/reportes', icon: 'stats-chart', roles: ['admin','empleado','visitante'] },
    { title: 'Calendario', path: '/calendar', icon: 'calendar-clear', roles: ['admin','empleado'] },
    { title: 'Reportes Gráficos', path: '/reportes-graficos', icon: 'bar-chart', roles: ['admin','empleado'] },
    { title: 'Usuarios', path: '/usuarios', icon: 'people-circle', roles: ['admin'] }
  ];

  visibleItems: DashboardItem[] = [];

  constructor(
    private auth: AuthService,
    private router: Router,
    private criaderoService: CriaderoActivoService,
    private notificacionesService: NotificacionesService
  ) {
    // Suscribirse al observable del criadero activo
    this.criaderoService.criaderoActivo$.subscribe(c => this.criaderoActivo = c);

    // Obtener rol del usuario y filtrar items visibles
    this.role = this.auth.getRole();
    this.visibleItems = this.items.filter(item => this.role && item.roles.includes(this.role));

    // Suscribirse a las notificaciones
    this.notificacionesService.notificaciones$.subscribe(n => this.notificaciones = n);

    // Ejemplo: agregar una notificación inicial
    this.notificacionesService.agregar('Bienvenido al sistema de gestión equina');
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  eliminarNotificacion(id: number) {
    this.notificacionesService.eliminar(id);
  }

  logout() {
    this.auth.logout();
    this.criaderoService.clearCriadero(); // Limpia el criadero activo
    this.router.navigate(['/login']);
  }
}