import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { AdminGuard } from './core/admin.guard';

import { InicioComponent } from './pages/inicio/inicio.component';
import { AppLayoutComponent } from './pages/layout/app-layout.component';

import { VehiculosComponent } from './pages/vehiculos/vehiculos.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { AlquileresComponent } from './pages/alquileres/alquileres.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { ReportesAlquileresComponent } from './pages/reportes-alquileres/reportes-alquileres.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },

  { path: 'inicio', component: InicioComponent },

  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'vehiculos', component: VehiculosComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'alquileres', component: AlquileresComponent },
      { path: 'reportes-alquileres', component: ReportesAlquileresComponent },
      { path: 'usuarios', component: UsuariosComponent, canActivate: [AdminGuard] },
      { path: '', pathMatch: 'full', redirectTo: 'vehiculos' },
    ]
  },

  { path: '**', redirectTo: 'inicio' }
];
