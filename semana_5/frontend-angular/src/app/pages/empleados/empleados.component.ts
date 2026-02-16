import { Component } from '@angular/core';
import { CrudTablaComponent, CrudConfig } from '../../shared/crud-tabla.component';
import { CampoForm } from '../../shared/campo-form.model';
import { EmpleadosService, Empleado } from '../../api/empleados.service';

@Component({
  standalone: true,
  imports: [CrudTablaComponent],
  template: `<app-crud-tabla [config]="cfg"></app-crud-tabla>`,
})
export class EmpleadosComponent {
  cfg: CrudConfig<Empleado>;

  constructor(private api: EmpleadosService){
    const campos: CampoForm[] = [
      { key:'nombre', label:'Nombre', tipo:'texto', requerido:true },
      { key:'apellido', label:'Apellido', tipo:'texto', requerido:true },
      { key:'email', label:'Correo', tipo:'correo', requerido:true },
      { key:'telefono', label:'Teléfono', tipo:'texto' },
    ];

    this.cfg = {
      titulo: 'Empleados',
      subtitulo: 'Mantenimiento de empleados (correo único).',
      idKey: 'empleadoId',
      columnas: [
        { key:'empleadoId', label:'ID' },
        { key:'nombre', label:'Nombre' },
        { key:'apellido', label:'Apellido' },
        { key:'email', label:'Correo' },
        { key:'telefono', label:'Teléfono' },
      ],
      camposCrear: campos,
      camposEditar: campos,
      cargar: () => this.api.listar(),
      crear: (p) => this.api.crear(p),
      actualizar: (id, p) => this.api.actualizar(id, p),
      eliminar: (id) => this.api.eliminar(id),
      ver: (e) => `
        <div style="text-align:left;">
          <b>ID:</b> ${e.empleadoId}<br>
          <b>Nombre:</b> ${e.nombre}<br>
          <b>Apellido:</b> ${e.apellido}<br>
          <b>Correo:</b> ${e.email}<br>
          <b>Teléfono:</b> ${e.telefono ?? ''}<br>
        </div>
      `
    };
  }
}
