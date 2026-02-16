import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { AppLayoutComponent } from './pages/layout/app-layout.component';
import { authGuard } from './core/auth.guard';
import { rolGuard } from './core/rol.guard';

import { DepartamentosComponent } from './pages/departamentos/departamentos.component';
import { EmpleadosComponent } from './pages/empleados/empleados.component';
import { AsignacionesComponent } from './pages/asignaciones/asignaciones.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent },

  {
    path: 'app',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'departamentos', pathMatch: 'full' },
      { path: 'departamentos', component: DepartamentosComponent },
      { path: 'empleados', component: EmpleadosComponent },
      { path: 'asignaciones', component: AsignacionesComponent },
      {
        path: 'usuarios',
        component: UsuariosComponent,
        canActivate: [rolGuard],
        data: { roles: ['administrador'] },
      },
    ],
  },

  { path: '**', redirectTo: 'inicio' },
];
