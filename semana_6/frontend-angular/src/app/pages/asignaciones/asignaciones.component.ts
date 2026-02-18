import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

import { ApiService } from '../../core/api.service';
import { SesionService } from '../../core/sesion.service';
import type { Empleado } from '../empleados/empleados.component';

type Departamento = {
  departamentoId: number;
  nombre: string;
  ubicacion: string | null;
  jefeDepartamento: string | null;
  extension: string | null;
};

type Asignacion = {
  asignacionId: number;
  empleadoId: number;
  departamentoId: number;
  fechaAsignacion: string;
  empleado?: Empleado;
  departamento?: Departamento;
};

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asignaciones.component.html',
  styleUrls: ['./asignaciones.component.css'],
})
export class AsignacionesComponent {
  private api = inject(ApiService);
  private ses = inject(SesionService);

  lista: Asignacion[] = [];
  paginaLista: Asignacion[] = [];

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

  nombreEmpleado(a: Asignacion) {
    if (a.empleado) return `${a.empleado.nombre} ${a.empleado.apellido}`;
    return `#${a.empleadoId}`;
  }

  nombreDepartamento(a: Asignacion) {
    if (a.departamento) return `${a.departamento.nombre}`;
    return `#${a.departamentoId}`;
  }

  async cargar(_forzar: boolean) {
    this.cargando = true;
    try {
      this.lista = await firstValueFrom(this.api.get<Asignacion[]>('/api/asignaciones'));
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

  async ver(a: Asignacion) {
    await Swal.fire({
      icon: 'info',
      title: `Asignación #${a.asignacionId}`,
      html: `
        <div style="text-align:left">
          <b>Empleado:</b> ${escapeHtml(this.nombreEmpleado(a))}<br>
          <b>Departamento:</b> ${escapeHtml(this.nombreDepartamento(a))}<br>
          <b>Fecha:</b> ${escapeHtml(a.fechaAsignacion)}<br>
        </div>
      `
    });
  }

  async nuevo() {
    try {
      const empleadosP = firstValueFrom(this.api.get<Empleado[]>('/api/empleados'));
      const departamentosP = firstValueFrom(this.api.get<Departamento[]>('/api/departamentos'));
      const [empleados, departamentos] = await Promise.all([empleadosP, departamentosP]); // ✅ tipado correcto

      const r = await Swal.fire({
        title: 'Nueva asignación',
        html: `
          <div style="text-align:left;display:grid;gap:10px">
            <label>Empleado</label>
            <select id="f_empleado" class="swal2-select">
              ${empleados.map(e => `<option value="${e.empleadoId}">${escapeHtml(e.nombre)} ${escapeHtml(e.apellido)} (#${e.empleadoId})</option>`).join('')}
            </select>

            <label>Departamento</label>
            <select id="f_departamento" class="swal2-select">
              ${departamentos.map(d => `<option value="${d.departamentoId}">${escapeHtml(d.nombre)} (#${d.departamentoId})</option>`).join('')}
            </select>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const empleadoId = Number((document.getElementById('f_empleado') as HTMLSelectElement).value);
          const departamentoId = Number((document.getElementById('f_departamento') as HTMLSelectElement).value);
          if (!empleadoId || !departamentoId) {
            Swal.showValidationMessage('Debe seleccionar empleado y departamento.');
            return null as any;
          }
          return { empleadoId, departamentoId };
        }
      });

      if (!r.isConfirmed) return;

      await firstValueFrom(this.api.post('/api/asignaciones', r.value));
      await Swal.fire({ icon: 'success', title: 'Creado', text: 'Asignación creada correctamente.' });
      await this.cargar(true);

    } catch (e: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: e?.message || 'No se pudo crear.' });
    }
  }

  async eliminar(a: Asignacion) {
    const r = await Swal.fire({
      icon: 'warning',
      title: 'Confirmar eliminación',
      text: `¿Eliminar la asignación #${a.asignacionId}?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!r.isConfirmed) return;

    try {
      await firstValueFrom(this.api.delete(`/api/asignaciones/${a.asignacionId}`));
      await Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Asignación eliminada.' });
      await this.cargar(true);
    } catch (e: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: e?.message || 'No se pudo eliminar.' });
    }
  }
}

function escapeHtml(v: any) {
  const s = String(v ?? '—');
  return s
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
