import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { ApiService } from '../../core/api.service';
import { SesionService } from '../../core/sesion.service';

type Rol = { rolId: number; nombre: string };
type Usuario = {
  usuarioId: number;
  username: string;
  activo: boolean;
  roles?: string[];
};

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent {
  private api = inject(ApiService);
  private sesion = inject(SesionService);

  lista: Usuario[] = [];
  paginaLista: Usuario[] = [];

  roles: Rol[] = [];
  filtro = '';
  pagina = 1;
  tamPagina = 10;

  total = 0;
  paginas = 1;
  desde = 0;
  hasta = 0;

  cargando = false;

  get esAdmin() { return this.sesion.tieneRol('administrador'); }

  async ngOnInit() {
    if (!this.esAdmin) {
      await Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'Solo el administrador puede gestionar usuarios.' });
      return;
    }
    await this.cargarRoles();
    await this.cargar(true);
  }

  async cargarRoles() {
    // Intento 1: API real
    try {
      this.roles = await firstValueFrom(this.api.get<Rol[]>('/api/roles'));
      return;
    } catch {
      // Fallback: si no existe endpoint de roles
      this.roles = [
        { rolId: 1, nombre: 'administrador' },
        { rolId: 2, nombre: 'supervisor' },
        { rolId: 3, nombre: 'empleado' },
      ];
    }
  }

  async cargar(_forzar: boolean) {
    this.cargando = true;
    try {
      this.lista = await firstValueFrom(this.api.get<Usuario[]>('/api/usuarios'));
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

  rolesTexto(u: Usuario) {
    return (u.roles || []).length ? (u.roles || []).join(', ') : '—';
  }

  async ver(u: Usuario) {
    await Swal.fire({
      icon: 'info',
      title: `Usuario #${u.usuarioId}`,
      html: `
        <div style="text-align:left">
          <b>Usuario:</b> ${escapeHtml(u.username)}<br>
          <b>Activo:</b> ${u.activo ? 'Sí' : 'No'}<br>
          <b>Roles:</b> ${escapeHtml(this.rolesTexto(u))}<br>
        </div>
      `,
    });
  }

  async nuevo() {
    const r = await Swal.fire({
      title: 'Nuevo usuario',
      html: formHtmlUsuario({ roles: this.roles, modo: 'nuevo' }),
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => leerFormUsuario({ roles: this.roles, validarPassword: true }),
    });

    if (!r.isConfirmed) return;

    try {
      // Payload esperado (recomendado):
      // { username, contrasena, activo, rolIds: number[] }
      await firstValueFrom(this.api.post('/api/usuarios', r.value));
      await Swal.fire({ icon: 'success', title: 'Creado', text: 'Usuario creado correctamente.' });
      await this.cargar(true);
    } catch (e: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: e?.message || 'No se pudo crear.' });
    }
  }

  async editar(u: Usuario) {
    const r = await Swal.fire({
      title: `Editar usuario #${u.usuarioId}`,
      html: formHtmlUsuario({
        roles: this.roles,
        modo: 'editar',
        username: u.username,
        activo: u.activo,
        // si tu API devuelve roles por nombre, no sabemos ids => no preseleccionamos
      }),
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => leerFormUsuario({ roles: this.roles, validarPassword: false }),
    });

    if (!r.isConfirmed) return;

    try {
      await firstValueFrom(this.api.put(`/api/usuarios/${u.usuarioId}`, r.value));
      await Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Usuario actualizado.' });
      await this.cargar(true);
    } catch (e: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: e?.message || 'No se pudo actualizar.' });
    }
  }

  async eliminar(u: Usuario) {
    const r = await Swal.fire({
      icon: 'warning',
      title: 'Confirmar eliminación',
      text: `¿Eliminar el usuario "${u.username}"?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!r.isConfirmed) return;

    try {
      await firstValueFrom(this.api.delete(`/api/usuarios/${u.usuarioId}`));
      await Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Usuario eliminado.' });
      await this.cargar(true);
    } catch (e: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: e?.message || 'No se pudo eliminar.' });
    }
  }
}

function escapeHtml(v: any) {
  const s = String(v ?? '—');
  return s.replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formHtmlUsuario(opts: {
  roles: { rolId: number; nombre: string }[];
  modo: 'nuevo' | 'editar';
  username?: string;
  activo?: boolean;
}) {
  const username = escapeHtml(opts.username ?? '');
  const activo = opts.activo ?? true;

  return `
    <div style="text-align:left;display:grid;gap:10px">
      <label>Usuario</label>
      <input id="f_username" class="swal2-input" value="${username}" placeholder="usuario" />

      <label>${opts.modo === 'nuevo' ? 'Contraseña' : 'Contraseña (dejar vacío si no cambia)'}</label>
      <input id="f_contrasena" type="password" class="swal2-input" value="" placeholder="********" />

      <label>Activo</label>
      <select id="f_activo" class="swal2-select">
        <option value="true" ${activo ? 'selected' : ''}>Sí</option>
        <option value="false" ${!activo ? 'selected' : ''}>No</option>
      </select>

      <label>Roles</label>
      <select id="f_roles" class="swal2-select" multiple size="3">
        ${(opts.roles || []).map(r => `<option value="${r.rolId}">${escapeHtml(r.nombre)}</option>`).join('')}
      </select>

      <div style="font-size:12px;color:#64748b">
        Para seleccionar varios roles: mantenga presionado Ctrl/Command.
      </div>
    </div>
  `;
}

function leerFormUsuario(opts: {
  roles: { rolId: number; nombre: string }[];
  validarPassword: boolean;
}) {
  const username = (document.getElementById('f_username') as HTMLInputElement).value.trim();
  const contrasena = (document.getElementById('f_contrasena') as HTMLInputElement).value;

  const activoRaw = (document.getElementById('f_activo') as HTMLSelectElement).value;
  const activo = activoRaw === 'true';

  const sel = document.getElementById('f_roles') as HTMLSelectElement;
  const rolIds = Array.from(sel.selectedOptions).map(o => Number(o.value)).filter(n => Number.isFinite(n));

  if (!username) { Swal.showValidationMessage('El usuario es obligatorio.'); return null as any; }
  if (opts.validarPassword && !contrasena) { Swal.showValidationMessage('La contraseña es obligatoria.'); return null as any; }
  if (!rolIds.length) { Swal.showValidationMessage('Debe seleccionar al menos un rol.'); return null as any; }

  // Payload recomendado para su backend:
  // - En creación: username, contrasena, activo, rolIds
  // - En edición: username, activo, rolIds (+ contrasena solo si viene)
  const payload: any = { username, activo, rolIds };
  if (contrasena && contrasena.trim().length) payload.contrasena = contrasena;

  return payload;
}
