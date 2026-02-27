import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/auth.service';
import { SesionService } from '../../core/sesion.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.css'
})
export class AppLayoutComponent {
  constructor(
    public ses: SesionService,
    private auth: AuthService,
    private router: Router
  ) {}

  async cerrar() {
    this.auth.cerrarSesion();
    await Swal.fire({ icon: 'success', title: 'Sesión cerrada', text: 'Se cerró la sesión correctamente.' });
    await this.router.navigate(['/inicio']);
  }
}
