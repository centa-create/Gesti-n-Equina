import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
   {
     path: 'login',
     loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
   },
   {
     path: 'registro',
     loadComponent: () => import('./pages/registro/registro.page').then(m => m.RegistroPage)
   },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'busqueda',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/busqueda/busqueda.page').then(m => m.BusquedaPage)
  },
  {
    path: 'criaderos',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/criaderos/criaderos.page').then(m => m.CriaderosPage)
  },
  {
    path: 'caballos',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin','empleado'] },
    loadComponent: () => import('./pages/caballos/caballos.page').then(m => m.CaballosPage)
  },
  {
    path: 'servicios',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin','empleado'] },
    loadComponent: () => import('./pages/servicios/servicios.page').then(m => m.ServiciosPage)
  },
  {
    path: 'finanzas',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./pages/finanzas/finanzas.page').then(m => m.FinanzasPage)
  },
  {
    path: 'inventario',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./pages/inventario/inventario.page').then(m => m.InventarioPage)
  },
  {
    path: 'clientes',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin','empleado'] },
    loadComponent: () => import('./pages/clientes/clientes.page').then(m => m.ClientesPage)
  },
  {
    path: 'eventos',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin','empleado'] },
    loadComponent: () => import('./pages/eventos/eventos.page').then(m => m.EventosPage)
  },
  {
    path: 'reportes',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin','empleado','visitante'] },
    loadComponent: () => import('./pages/reportes/reportes.page').then(m => m.ReportesPage)
  },
  {
    path: 'produccion',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin','empleado'] },
    loadComponent: () => import('./pages/produccion/produccion.page').then(m => m.ProduccionPage)
  },
  {
    path: 'calendar',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin','empleado'] },
    loadComponent: () => import('./pages/calendar/calendar.page').then(m => m.CalendarPage)
  },
  {
    path: 'reportes-graficos',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin','empleado'] },
    loadComponent: () => import('./pages/reportes-graficos/reportes-graficos.page').then(m => m.ReportesGraficosPage)
  },
  {
    path: 'montadores',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin','empleado'] },
    loadComponent: () => import('./pages/montadores/montadores.page').then(m => m.MontadoresPage)
  },
  {
    path: 'herrajes',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin','empleado'] },
    loadComponent: () => import('./pages/herrajes/herrajes.page').then(m => m.HerrajesPage)
  },
  {
    path: 'camera',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/camera/camera.page').then(m => m.CameraPage)
  },
  {
    path: 'location',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/location/location.page').then(m => m.LocationPage)
  },
  {
    path: 'usuarios',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./pages/usuarios/usuarios.page').then(m => m.UsuariosPage)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/unauthorized/unauthorized.page').then(m => m.UnauthorizedPage)
  },
  {
    path: 'tienda',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/tienda/tienda.page').then(m => m.TiendaPage)
  },
  {
    path: 'marketplace',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/marketplace/marketplace.page').then(m => m.MarketplacePage)
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

];