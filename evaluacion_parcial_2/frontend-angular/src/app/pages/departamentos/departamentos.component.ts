import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { SesionService } from '../../core/sesion.service';
import { escapeHtml, filtrarPorTexto, paginar, alertError } from '../_shared/crud-helpers';

type Departamento = {
  departamentoId: number;
  nombre: string;
  ubicacion: string | null;
  jefeDepartamento: string | null;
  extension: string | null;
};

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departamentos.component.html',
  styleUrl: './departamentos.component.css'
})
export class DepartamentosComponent {
  lista: Departamento[] = [];
  paginaLista: Departamento[] = [];

  filtro = '';
  pagina = 1;
  tamPagina = 10;

  total = 0; paginas = 1; desde = 0; hasta = 0;
  cargando = false;

  constructor(private api: ApiService, public ses: SesionService) {}

  async ngOnInit() {
    await this.cargar();
  }

  async cargar() {
    this.cargando = true;
    try {
      this.lista = await firstValueFrom(this.api.get<Departamento[]>('/api/departamentos'));
      this.aplicar();
    } catch (e) {
      await alertError('Error', e);
    } finally {
      this.cargando = false;
    }
  }

  aplicar() {
    const filtrada = filtrarPorTexto(this.lista, this.filtro);
    const p = paginar(filtrada, this.pagina, this.tamPagina);

    this.total = p.total;
    this.paginas = p.paginas;
    this.pagina = p.pagina;
    this.desde = p.desde;
    this.hasta = p.hasta;
    this.paginaLista = p.paginaLista;
  }

  prev(){ if(this.pagina>1){ this.pagina--; this.aplicar(); } }
  next(){ if(this.pagina<this.paginas){ this.pagina++; this.aplicar(); } }

  async ver(d: Departamento) {
    await Swal.fire({
      icon: 'info',
      title: `Departamento #${d.departamentoId}`,
      html: `<div style="text-align:left">
        <b>Nombre:</b> ${escapeHtml(d.nombre)}<br>
        <b>Ubicación:</b> ${escapeHtml(d.ubicacion)}<br>
        <b>Jefe:</b> ${escapeHtml(d.jefeDepartamento)}<br>
        <b>Extensión:</b> ${escapeHtml(d.extension)}<br>
      </div>`
    });
  }

  async nuevo() {
    const r = await Swal.fire({
      title: 'Nuevo departamento',
      html: this.formHtml({}),
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => this.leerForm(true)
    });

    if (!r.isConfirmed) return;

    try {
      await firstValueFrom(this.api.post('/api/departamentos', r.value));
      await Swal.fire({ icon:'success', title:'Creado', text:'Departamento creado correctamente.' });
      await this.cargar();
    } catch (e) {
      await alertError('Error', e);
    }
  }

  async editar(d: Departamento) {
    const r = await Swal.fire({
      title: `Editar departamento #${d.departamentoId}`,
      html: this.formHtml(d),
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => this.leerForm(true)
    });

    if (!r.isConfirmed) return;

    try {
      await firstValueFrom(this.api.put(`/api/departamentos/${d.departamentoId}`, r.value));
      await Swal.fire({ icon:'success', title:'Actualizado', text:'Departamento actualizado.' });
      await this.cargar();
    } catch (e) {
      await alertError('Error', e);
    }
  }

  async eliminar(d: Departamento) {
    const r = await Swal.fire({
      icon: 'warning',
      title: 'Confirmar eliminación',
      text: `¿Eliminar el departamento "${d.nombre}"?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!r.isConfirmed) return;

    try {
      await firstValueFrom(this.api.delete(`/api/departamentos/${d.departamentoId}`));
      await Swal.fire({ icon:'success', title:'Eliminado', text:'Departamento eliminado.' });
      await this.cargar();
    } catch (e) {
      await alertError('Error', e);
    }
  }

  private formHtml(d: Partial<Departamento>) {
    return `
      <div style="text-align:left;display:grid;gap:10px">
        <label>Nombre</label>
        <input id="f_nombre" class="swal2-input" value="${escapeHtml(d.nombre ?? '')}" />
        <label>Ubicación</label>
        <input id="f_ubicacion" class="swal2-input" value="${escapeHtml(d.ubicacion ?? '')}" />
        <label>Jefe del departamento</label>
        <input id="f_jefe" class="swal2-input" value="${escapeHtml(d.jefeDepartamento ?? '')}" />
        <label>Extensión</label>
        <input id="f_extension" class="swal2-input" value="${escapeHtml(d.extension ?? '')}" />
      </div>
    `;
  }

  private leerForm(validar: boolean) {
    const nombre = (document.getElementById('f_nombre') as HTMLInputElement).value.trim();
    const ubicacion = (document.getElementById('f_ubicacion') as HTMLInputElement).value.trim() || null;
    const jefeDepartamento = (document.getElementById('f_jefe') as HTMLInputElement).value.trim() || null;
    const extension = (document.getElementById('f_extension') as HTMLInputElement).value.trim() || null;

    if (validar && !nombre) {
      Swal.showValidationMessage('El nombre es obligatorio.');
      return null as any;
    }
    return { nombre, ubicacion, jefeDepartamento, extension };
  }
}
