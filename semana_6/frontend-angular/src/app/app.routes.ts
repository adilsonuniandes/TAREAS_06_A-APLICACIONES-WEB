import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { AdminGuard } from './core/admin.guard';

import { InicioComponent } from './pages/inicio/inicio.component';
import { AppLayoutComponent } from './pages/layout/app-layout.component';

import { DepartamentosComponent } from './pages/departamentos/departamentos.component';
import { EmpleadosComponent } from './pages/empleados/empleados.component';
import { AsignacionesComponent } from './pages/asignaciones/asignaciones.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },

  { path: 'inicio', component: InicioComponent },

  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'departamentos', component: DepartamentosComponent },
      { path: 'empleados', component: EmpleadosComponent },
      { path: 'asignaciones', component: AsignacionesComponent },
      { path: 'usuarios', component: UsuariosComponent, canActivate: [AdminGuard] },
      { path: '', pathMatch: 'full', redirectTo: 'departamentos' },
    ]
  },

  { path: '**', redirectTo: 'inicio' }
];
