import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../core/auth.service';
import { SesionService } from '../../core/sesion.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
  <div class="wrap">
    <mat-card class="card">
      <div class="brand">
        <div class="logo">SG</div>
        <div>
          <div class="t1">Sistema de Gestión</div>
          <div class="t2">Departamentos • Empleados • Asignaciones</div>
        </div>
      </div>

      <h2>Inicio de sesión</h2>
      <div class="muted">Use: admin/admin123, supervisor/supervisor123, empleado/empleado123</div>

      <form [formGroup]="form" (ngSubmit)="ingresar()" class="form">
        <mat-form-field appearance="outline">
          <mat-label>Usuario</mat-label>
          <input matInput formControlName="username" autocomplete="username">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Contraseña</mat-label>
          <input matInput type="password" formControlName="contrasena" autocomplete="current-password">
        </mat-form-field>

        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || cargando">
          Ingresar
        </button>
      </form>
    </mat-card>
  </div>
  `,
  styles: [`
    .wrap{ min-height: 100vh; display:grid; place-items:center; padding:24px; background:#f6f7fb; }
    .card{ width: min(520px, 94vw); padding: 18px; border-radius: 16px; }
    .brand{ display:flex; gap:12px; align-items:center; margin-bottom:12px; }
    .logo{ width:42px; height:42px; border-radius:12px; display:grid; place-items:center; background:#111827; color:#fff; font-weight:800; }
    .t1{ font-weight:700; }
    .t2{ opacity:.7; font-size: 13px; }
    .muted{ opacity:.7; margin: 6px 0 10px; }
    .form{ display:grid; gap: 12px; margin-top: 10px; }
  `]
})
export class InicioComponent {
  cargando = false;

  form = this.fb.group({
    username: ['', [Validators.required]],
    contrasena: ['', [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private sesion: SesionService,
    private router: Router
  ){
    if(this.sesion.tieneToken()){
      this.router.navigateByUrl('/app/departamentos');
    }
  }

  async ingresar(){
    if(this.form.invalid) return;
    this.cargando = true;
    const { username, contrasena } = this.form.value;

    try{
      const data = await this.auth.iniciarSesion(username!, contrasena!);
      this.sesion.guardar(data);
      await Swal.fire({ icon:'success', title:'Bienvenido', text:`Sesión iniciada como ${data.username}.` });
      this.router.navigateByUrl('/app/departamentos');
    }catch(e: any){
      await Swal.fire({ icon:'error', title:'Error de inicio de sesión', text: String(e?.message ?? e) });
    }finally{
      this.cargando = false;
    }
  }
}
