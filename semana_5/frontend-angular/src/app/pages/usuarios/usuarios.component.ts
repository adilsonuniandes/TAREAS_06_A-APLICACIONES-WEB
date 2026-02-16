import { Component } from '@angular/core';
import { CrudTablaComponent, CrudConfig } from '../../shared/crud-tabla.component';
import { CampoForm } from '../../shared/campo-form.model';
import { UsuariosService, Usuario } from '../../api/usuarios.service';
import { RolesService } from '../../api/roles.service';

@Component({
  standalone: true,
  imports: [CrudTablaComponent],
  template: `<app-crud-tabla [config]="cfg"></app-crud-tabla>`,
})
export class UsuariosComponent {
  cfg: CrudConfig<Usuario>;

  constructor(private api: UsuariosService, private rolesApi: RolesService){
    const camposCrear: CampoForm[] = [
      { key:'username', label:'Usuario', tipo:'texto', requerido:true },
      { key:'contrasena', label:'Contraseña', tipo:'password', requerido:true },
      { key:'activo', label:'Activo', tipo:'switch' },
      { key:'rolIds', label:'Rol', tipo:'select', requerido:true, opciones: [] }, // 1 rol por simplicidad
    ];

    const camposEditar: CampoForm[] = [
      { key:'username', label:'Usuario', tipo:'texto', requerido:true },
      { key:'activo', label:'Activo', tipo:'switch' },
      { key:'rolIds', label:'Rol', tipo:'select', requerido:true, opciones: [] },
      { key:'contrasena', label:'Nueva contraseña', tipo:'password', requerido:false, ocultarEnEdicion:false },
    ];

    this.cfg = {
      titulo: 'Usuarios',
      subtitulo: 'Administración de usuarios (solo administrador).',
      idKey: 'usuarioId',
      columnas: [
        { key:'usuarioId', label:'ID' },
        { key:'username', label:'Usuario' },
        { key:'activo', label:'Activo', render: (u) => u.activo ? 'Sí' : 'No' },
        { key:'roles', label:'Roles', render: (u) => (u.roles ?? []).join(', ') },
      ],
      camposCrear,
      camposEditar,
      cargar: () => this.api.listar(),
      crear: async (p) => {
        await this.api.crear({
          username: String(p.username).trim(),
          contrasena: String(p.contrasena),
          activo: !!p.activo,
          rolIds: [Number(p.rolIds)],
        });
      },
      actualizar: async (id, p) => {
        const payload: any = {
          username: String(p.username).trim(),
          activo: !!p.activo,
          rolIds: [Number(p.rolIds)],
        };
        if (p.contrasena && String(p.contrasena).trim().length > 0) {
          payload.contrasena = String(p.contrasena);
        }
        await this.api.actualizar(Number(id), payload);
      },
      eliminar: (id) => this.api.eliminar(Number(id)),
      ver: (u) => `
        <div style="text-align:left;">
          <b>ID:</b> ${u.usuarioId}<br>
          <b>Usuario:</b> ${u.username}<br>
          <b>Activo:</b> ${u.activo ? 'Sí' : 'No'}<br>
          <b>Roles:</b> ${(u.roles ?? []).join(', ')}<br>
        </div>
      `
    };

    this.cargarRoles().catch(() => {});
  }

  private async cargarRoles(){
    const roles = await this.rolesApi.listar();
    const opciones = roles.map(r => ({ value: r.rolId, text: r.nombre }));
    this.cfg.camposCrear.find(c => c.key === 'rolIds')!.opciones = opciones;
    this.cfg.camposEditar?.find(c => c.key === 'rolIds')!.opciones = opciones;
  }
}
