import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { SesionService } from '../../core/sesion.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  username = '';
  contrasena = '';
  cargando = false;

  constructor(
    private auth: AuthService,
    private ses: SesionService,
    private router: Router
  ) {}

  async ngOnInit() {
    if (this.ses.autenticado()) {
      await this.router.navigate(['/departamentos']);
    }
  }

  async ingresar() {
    this.cargando = true;
    try {
      await this.auth.iniciarSesion(this.username.trim(), this.contrasena);
      await Swal.fire({ icon: 'success', title: 'Bienvenido', text: `Sesión iniciada como ${this.username.trim()}.` });
      await this.router.navigate(['/departamentos']);
    } catch (e: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: e?.message || 'Credenciales inválidas o error de red.' });
    } finally {
      this.cargando = false;
    }
  }
}
