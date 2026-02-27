import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

import { ApiService } from '../../core/api.service';
import { SesionService } from '../../core/sesion.service';

export type Empleado = {
  empleadoId: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
};

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css'],
})
export class EmpleadosComponent {
  private api = inject(ApiService);
  private ses = inject(SesionService);

  lista: Empleado[] = [];
  paginaLista: Empleado[] = [];

  filtro = '';
  pagina = 1;
  tamPagina = 10;

  total = 0;
  paginas = 1;
  desde = 0;
  hasta = 0;

  cargando = false;

  get puedeEscribir() { return this.ses.puedeEscribir(); }
  get puedeEliminar() { return this.ses.puedeEliminar(); }

  async ngOnInit() {
    await this.cargar(true);
  }

  async cargar(_forzar: boolean) {
    this.cargando = true;
    try {
      this.lista = await firstValueFrom(this.api.get<Empleado[]>('/api/empleados'));
      this.aplicar();
    } catch (e: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: e?.message || 'No se pudo cargar.' });
    } finally {
      this.cargando = false;
    }
  }

  aplicar() {
    const f = this.filtro.trim().toLowerCase();
    const filtrada = !f ? this.lista : this.lista.filter(x => JSON.stringify(x).toLowerCase().includes(f));

    this.total = filtrada.length;
    this.paginas = Math.max(1, Math.ceil(this.total / this.tamPagina));

    if (this.pagina > this.paginas) this.pagina = this.paginas;
    if (this.pagina < 1) this.pagina = 1;

    const ini = (this.pagina - 1) * this.tamPagina;
    const fin = Math.min(ini + this.tamPagina, this.total);

    this.desde = this.total === 0 ? 0 : ini + 1;
    this.hasta = fin;
    this.paginaLista = filtrada.slice(ini, fin);
  }

  prev() { if (this.pagina > 1) { this.pagina--; this.aplicar(); } }
  next() { if (this.pagina < this.paginas) { this.pagina++; this.aplicar(); } }

  async ver(e: Empleado) {
    await Swal.fire({
      icon: 'info',
      title: `Empleado #${e.empleadoId}`,
      html: `
        <div style="text-align:left">
          <b>Nombre:</b> ${escapeHtml(e.nombre)}<br>
          <b>Apellido:</b> ${escapeHtml(e.apellido)}<br>
          <b>Correo:</b> ${escapeHtml(e.email)}<br>
          <b>Teléfono:</b> ${escapeHtml(e.telefono)}<br>
        </div>
      `
    });
  }

  async nuevo() {
    const r = await Swal.fire({
      title: 'Nuevo empleado',
      html: formHtmlEmpleado(),
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => leerFormEmpleado(true)
    });
    if (!r.isConfirmed) return;

    try {
      await firstValueFrom(this.api.post('/api/empleados', r.value));
      await Swal.fire({ icon: 'success', title: 'Creado', text: 'Empleado creado correctamente.' });
      await this.cargar(true);
    } catch (e: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: e?.message || 'No se pudo crear.' });
    }
  }

  async editar(e: Empleado) {
    const r = await Swal.fire({
      title: `Editar empleado #${e.empleadoId}`,
      html: formHtmlEmpleado(e),
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => leerFormEmpleado(true)
    });
    if (!r.isConfirmed) return;

    try {
      await firstValueFrom(this.api.put(`/api/empleados/${e.empleadoId}`, r.value));
      await Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Empleado actualizado.' });
      await this.cargar(true);
    } catch (e2: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: e2?.message || 'No se pudo actualizar.' });
    }
  }

  async eliminar(e: Empleado) {
    const r = await Swal.fire({
      icon: 'warning',
      title: 'Confirmar eliminación',
      text: `¿Eliminar al empleado "${e.nombre} ${e.apellido}"?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!r.isConfirmed) return;

    try {
      await firstValueFrom(this.api.delete(`/api/empleados/${e.empleadoId}`));
      await Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Empleado eliminado.' });
      await this.cargar(true);
    } catch (e2: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: e2?.message || 'No se pudo eliminar.' });
    }
  }
}

function escapeHtml(v: any) {
  const s = String(v ?? '—');
  return s
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function formHtmlEmpleado(e?: Partial<Empleado>) {
  const nombre = escapeHtml(e?.nombre ?? '');
  const apellido = escapeHtml(e?.apellido ?? '');
  const email = escapeHtml(e?.email ?? '');
  const telefono = escapeHtml(e?.telefono ?? '');
  return `
    <div style="text-align:left;display:grid;gap:10px">
      <label>Nombre</label>
      <input id="f_nombre" class="swal2-input" value="${nombre}" />
      <label>Apellido</label>
      <input id="f_apellido" class="swal2-input" value="${apellido}" />
      <label>Correo</label>
      <input id="f_email" class="swal2-input" value="${email}" />
      <label>Teléfono</label>
      <input id="f_telefono" class="swal2-input" value="${telefono}" />
    </div>
  `;
}

function leerFormEmpleado(validar: boolean) {
  const nombre = (document.getElementById('f_nombre') as HTMLInputElement).value.trim();
  const apellido = (document.getElementById('f_apellido') as HTMLInputElement).value.trim();
  const email = (document.getElementById('f_email') as HTMLInputElement).value.trim();
  const telefono = (document.getElementById('f_telefono') as HTMLInputElement).value.trim() || null;

  if (validar) {
    if (!nombre) { Swal.showValidationMessage('El nombre es obligatorio.'); return null as any; }
    if (!apellido) { Swal.showValidationMessage('El apellido es obligatorio.'); return null as any; }
    if (!email) { Swal.showValidationMessage('El correo es obligatorio.'); return null as any; }
  }
  return { nombre, apellido, email, telefono };
}
