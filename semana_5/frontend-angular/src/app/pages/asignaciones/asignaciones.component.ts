import { Component } from '@angular/core';
import { CrudTablaComponent, CrudConfig } from '../../shared/crud-tabla.component';
import { CampoForm } from '../../shared/campo-form.model';
import { AsignacionesService, Asignacion } from '../../api/asignaciones.service';
import { EmpleadosService } from '../../api/empleados.service';
import { DepartamentosService } from '../../api/departamentos.service';

@Component({
  standalone: true,
  imports: [CrudTablaComponent],
  template: `<app-crud-tabla [config]="cfg"></app-crud-tabla>`,
})
export class AsignacionesComponent {
  cfg: CrudConfig<Asignacion>;

  constructor(
    private api: AsignacionesService,
    private emp: EmpleadosService,
    private dep: DepartamentosService
  ){
    const camposCrear: CampoForm[] = [
      { key:'empleadoId', label:'Empleado', tipo:'select', requerido:true, opciones: [] },
      { key:'departamentoId', label:'Departamento', tipo:'select', requerido:true, opciones: [] },
    ];

    this.cfg = {
      titulo: 'Asignaciones',
      subtitulo: 'Asignar empleados a departamentos.',
      idKey: 'asignacionId',
      columnas: [
        { key:'asignacionId', label:'ID' },
        { key:'empleado', label:'Empleado', render: (a) => a.empleado ? `${a.empleado.nombre} ${a.empleado.apellido}` : `#${a.empleadoId}` },
        { key:'departamento', label:'Departamento', render: (a) => a.departamento ? `${a.departamento.nombre}` : `#${a.departamentoId}` },
        { key:'fechaAsignacion', label:'Fecha' },
      ],
      camposCrear,
      camposEditar: camposCrear, // puedes dejar igual o bloquear edición si no aplica
      cargar: () => this.api.listar(),
      crear: async (p) => {
        await this.api.crear({
          empleadoId: Number(p.empleadoId),
          departamentoId: Number(p.departamentoId),
        });
      },
      actualizar: async () => { throw new Error('No aplica edición de asignación en esta evaluación.'); },
      eliminar: (id) => this.api.eliminar(id),
      ver: (a) => `
        <div style="text-align:left;">
          <b>ID:</b> ${a.asignacionId}<br>
          <b>Empleado:</b> ${a.empleado ? `${a.empleado.nombre} ${a.empleado.apellido}` : `#${a.empleadoId}`}<br>
          <b>Departamento:</b> ${a.departamento ? a.departamento.nombre : `#${a.departamentoId}`}<br>
          <b>Fecha:</b> ${a.fechaAsignacion ?? ''}<br>
        </div>
      `
    };

    this.cargarOpciones(camposCrear).catch(() => {});
  }

  private async cargarOpciones(campos: CampoForm[]){
    const [empleados, departamentos] = await Promise.all([this.emp.listar(), this.dep.listar()]);
    const cEmp = campos.find(x => x.key === 'empleadoId');
    const cDep = campos.find(x => x.key === 'departamentoId');
    if (cEmp) cEmp.opciones = empleados.map(e => ({ value: e.empleadoId, text: `${e.nombre} ${e.apellido} (#${e.empleadoId})` }));
    if (cDep) cDep.opciones = departamentos.map(d => ({ value: d.departamentoId, text: `${d.nombre} (#${d.departamentoId})` }));
  }
}
