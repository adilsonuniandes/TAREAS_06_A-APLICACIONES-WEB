import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';

type Alquiler = {
  alquilerId: number;
  vehiculoId: number;
  clienteId: number;
  fechaInicio: string;
  fechaFin?: string | null;
  activo: boolean;
};

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes-alquileres.component.html',
  styleUrls: ['./reportes-alquileres.component.css']
})
export class ReportesAlquileresComponent implements OnInit {
  alquileres: Alquiler[] = [];

  total = 0;
  activos = 0;
  cerrados = 0;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.api.get<Alquiler[]>('/api/alquileres').subscribe({
      next: (data) => {
        this.alquileres = data || [];
        this.total = this.alquileres.length;
        this.activos = this.alquileres.filter(a => a.activo).length;
        this.cerrados = this.total - this.activos;
      }
    });
  }

  exportarCsv(): void {
    const encabezado = ['alquiler_id','vehiculo_id','cliente_id','fecha_inicio','fecha_fin','activo'];
    const filas = this.alquileres.map(a => ([
      a.alquilerId,
      a.vehiculoId,
      a.clienteId,
      a.fechaInicio,
      a.fechaFin ?? '',
      a.activo ? 1 : 0
    ]));

    const csv = [encabezado, ...filas]
      .map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_alquileres_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }
}
