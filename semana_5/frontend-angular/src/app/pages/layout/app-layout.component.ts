import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { SesionService } from '../../core/sesion.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatButtonModule,
  ],
  template: `
  <mat-sidenav-container class="root">
    <mat-sidenav mode="side" opened class="side">
      <div class="brand">
        <div class="logo">SG</div>
        <div>
          <div class="t1">Sistema de Gestión</div>
          <div class="t2">Usuario: {{ username() }}</div>
        </div>
      </div>

      <mat-nav-list>
        <a mat-list-item routerLink="/app/departamentos" routerLinkActive="activa">Departamentos</a>
        <a mat-list-item routerLink="/app/empleados" routerLinkActive="activa">Empleados</a>
        <a mat-list-item routerLink="/app/asignaciones" routerLinkActive="activa">Asignaciones</a>
        <a mat-list-item
           *ngIf="esAdmin()"
           routerLink="/app/usuarios"
           routerLinkActive="activa">
          Usuarios
        </a>
      </mat-nav-list>

      <div class="footer">
        <div class="roles">Roles: {{ roles() }}</div>
        <button mat-stroked-button (click)="cerrar()">Cerrar sesión</button>
      </div>
    </mat-sidenav>

    <mat-sidenav-content class="content">
      <mat-toolbar class="top">
        <span>Evaluación Parcial</span>
        <span class="sp"></span>
        <span class="muted">{{ roles() }}</span>
      </mat-toolbar>

      <div class="page">
        <router-outlet />
      </div>
    </mat-sidenav-content>
  </mat-sidenav-container>
  `,
  styles: [`
    .root{ height:100vh; background:#f6f7fb; }
    .side{ width: 290px; padding: 14px; background: #0b1220; color: #e5e7eb; }
    .brand{ display:flex; gap:12px; align-items:center; padding: 6px 6px 14px; }
    .logo{ width:40px; height:40px; border-radius:12px; display:grid; place-items:center; background:#111827; color:#fff; font-weight:800; }
    .t1{ font-weight:700; }
    .t2{ opacity:.75; font-size: 13px; margin-top:2px; }
    .footer{ margin-top:auto; padding: 14px 6px 6px; display:grid; gap:10px; }
    .roles{ opacity:.85; font-size: 13px; }
    .top{ position: sticky; top:0; z-index:10; background:#ffffff; border-bottom:1px solid rgba(0,0,0,.06); }
    .content{ background:#f6f7fb; }
    .page{ padding: 18px; }
    .sp{ flex:1; }
    .muted{ opacity:.7; font-size: 13px; }
    :host ::ng-deep a.activa{ background: rgba(255,255,255,.08); border-radius: 10px; }
  `]
})
export class AppLayoutComponent {
  private sesion = inject(SesionService);
  private router = inject(Router);

  username = computed(() => this.sesion.leer()?.username ?? '—');
  roles = computed(() => (this.sesion.leer()?.roles ?? []).join(', ') || '—');
  esAdmin = computed(() => this.sesion.tieneRol('administrador'));

  async cerrar(){
    this.sesion.limpiar();
    await Swal.fire({ icon:'success', title:'Sesión cerrada', text:'Se cerró la sesión correctamente.' });
    this.router.navigateByUrl('/inicio');
  }
}
