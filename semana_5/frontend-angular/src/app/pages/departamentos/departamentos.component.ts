import { Component } from '@angular/core';
import { CrudTablaComponent, CrudConfig } from '../../shared/crud-tabla.component';
import { CampoForm } from '../../shared/campo-form.model';
import { DepartamentosService, Departamento } from '../../api/departamentos.service';

@Component({
  standalone: true,
  imports: [CrudTablaComponent],
  template: `<app-crud-tabla [config]="cfg"></app-crud-tabla>`,
})
export class DepartamentosComponent {
  cfg: CrudConfig<Departamento>;

  constructor(private api: DepartamentosService){
    const campos: CampoForm[] = [
      { key:'nombre', label:'Nombre', tipo:'texto', requerido:true },
      { key:'ubicacion', label:'Ubicación', tipo:'texto' },
      { key:'jefeDepartamento', label:'Jefe del departamento', tipo:'texto' },
      { key:'extension', label:'Extensión', tipo:'texto' },
    ];

    this.cfg = {
      titulo: 'Departamentos',
      subtitulo: 'Mantenimiento de departamentos.',
      idKey: 'departamentoId',
      columnas: [
        { key:'departamentoId', label:'ID' },
        { key:'nombre', label:'Nombre' },
        { key:'ubicacion', label:'Ubicación' },
        { key:'jefeDepartamento', label:'Jefe' },
        { key:'extension', label:'Extensión' },
      ],
      camposCrear: campos,
      camposEditar: campos,
      cargar: () => this.api.listar(),
      crear: (p) => this.api.crear(p),
      actualizar: (id, p) => this.api.actualizar(id, p),
      eliminar: (id) => this.api.eliminar(id),
      ver: (d) => `
        <div style="text-align:left;">
          <b>ID:</b> ${d.departamentoId}<br>
          <b>Nombre:</b> ${d.nombre}<br>
          <b>Ubicación:</b> ${d.ubicacion ?? ''}<br>
          <b>Jefe:</b> ${d.jefeDepartamento ?? ''}<br>
          <b>Extensión:</b> ${d.extension ?? ''}<br>
        </div>
      `
    };
  }
}
