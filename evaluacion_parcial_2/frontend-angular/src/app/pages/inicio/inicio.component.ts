import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-inicio',
  imports: [CommonModule, FormsModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent {
  username = '';
  contrasena = '';
  cargando = false;

  constructor(private auth: AuthService, private router: Router) {}

  async ingresar(): Promise<void> {
    if (this.cargando) return;
    this.cargando = true;

    try {
      await this.auth.iniciarSesion(this.username, this.contrasena);

      await Swal.fire({
        icon: 'success',
        title: 'Bienvenido',
        text: `Hola, ${this.username}`,
        timer: 1200,
        showConfirmButton: false
      });

      await this.router.navigateByUrl('/vehiculos');
    } catch (e) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Credenciales inválidas'
      });
    } finally {
      this.cargando = false;
    }
  }
}
