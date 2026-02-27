import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ApiService } from '../../core/api.service';

type Vehiculo = { vehiculoId: number; marca: string; modelo: string; disponible: boolean };
type Cliente = { clienteId: number; nombre: string; apellido: string };
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
  templateUrl: './alquileres.component.html',
  styleUrls: ['./alquileres.component.css']
})
export class AlquileresComponent implements OnInit {
  alquileres: Alquiler[] = [];
  vehiculos: Vehiculo[] = [];
  clientes: Cliente[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.cargarTodo();
  }

  async cargarTodo(): Promise<void> {
    this.vehiculos = await this.api.get<Vehiculo[]>('/api/vehiculos').toPromise() as Vehiculo[];
    this.clientes = await this.api.get<Cliente[]>('/api/clientes').toPromise() as Cliente[];
    this.alquileres = await this.api.get<Alquiler[]>('/api/alquileres').toPromise() as Alquiler[];
  }

  nombreVehiculo(id: number): string {
    const v = this.vehiculos.find(x => x.vehiculoId === id);
    return v ? `${v.marca} ${v.modelo}` : `#${id}`;
  }

  nombreCliente(id: number): string {
    const c = this.clientes.find(x => x.clienteId === id);
    return c ? `${c.nombre} ${c.apellido}` : `#${id}`;
  }

  async nuevo(): Promise<void> {
    const opcionesVehiculos = this.vehiculos
      .filter(v => v.disponible)
      .map(v => `<option value="${v.vehiculoId}">${v.marca} ${v.modelo}</option>`)
      .join('');

    const opcionesClientes = this.clientes
      .map(c => `<option value="${c.clienteId}">${c.nombre} ${c.apellido}</option>`)
      .join('');

    const r = await Swal.fire({
      title: 'Nuevo alquiler',
      html:
        `<select id="vehiculo" class="swal2-input">${opcionesVehiculos}</select>` +
        `<select id="cliente" class="swal2-input">${opcionesClientes}</select>` +
        `<input id="inicio" type="date" class="swal2-input">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const vehiculoId = Number((document.getElementById('vehiculo') as HTMLSelectElement).value);
        const clienteId = Number((document.getElementById('cliente') as HTMLSelectElement).value);
        const fechaInicio = (document.getElementById('inicio') as HTMLInputElement).value;
        if (!vehiculoId || !clienteId || !fechaInicio) return null;
        return { vehiculoId, clienteId, fechaInicio };
      }
    });

    if (!r.value) return;

    await this.api.post('/api/alquileres', r.value).toPromise();
    await this.cargarTodo();
  }

  async cerrar(a: Alquiler): Promise<void> {
    const r = await Swal.fire({
      title: `Cerrar alquiler #${a.alquilerId}`,
      html: `<input id="fin" type="date" class="swal2-input">`,
      showCancelButton: true,
      confirmButtonText: 'Cerrar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const fechaFin = (document.getElementById('fin') as HTMLInputElement).value;
        if (!fechaFin) return null;
        return { fechaFin };
      }
    });

    if (!r.value) return;

    await this.api.put(`/api/alquileres/${a.alquilerId}/cerrar`, r.value).toPromise();
    await this.cargarTodo();
  }
}
