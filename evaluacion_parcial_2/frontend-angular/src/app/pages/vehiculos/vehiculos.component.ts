import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ApiService } from '../../core/api.service';

type Vehiculo = {
  vehiculoId: number;
  marca: string;
  modelo: string;
  anio: number;
  disponible: boolean;
};

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehiculos.component.html',
  styleUrls: ['./vehiculos.component.css']
})
export class VehiculosComponent implements OnInit {
  vehiculos: Vehiculo[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.cargar();
  }

  async cargar(): Promise<void> {
    this.vehiculos = await this.api.get<Vehiculo[]>('/api/vehiculos').toPromise() as Vehiculo[];
  }

  async nuevo(): Promise<void> {
    const r = await Swal.fire({
      title: 'Nuevo vehículo',
      html:
        '<input id="marca" class="swal2-input" placeholder="Marca">' +
        '<input id="modelo" class="swal2-input" placeholder="Modelo">' +
        '<input id="anio" type="number" class="swal2-input" placeholder="Año">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const marca = (document.getElementById('marca') as HTMLInputElement).value.trim();
        const modelo = (document.getElementById('modelo') as HTMLInputElement).value.trim();
        const anio = Number((document.getElementById('anio') as HTMLInputElement).value);
        if (!marca || !modelo || !anio) return null;
        return { marca, modelo, anio };
      }
    });

    if (!r.value) return;

    await this.api.post('/api/vehiculos', r.value).toPromise();
    await this.cargar();
  }

  async editar(v: Vehiculo): Promise<void> {
    const r = await Swal.fire({
      title: `Actualizar vehículo #${v.vehiculoId}`,
      html:
        `<input id="marca" class="swal2-input" placeholder="Marca" value="${v.marca}">` +
        `<input id="modelo" class="swal2-input" placeholder="Modelo" value="${v.modelo}">` +
        `<input id="anio" type="number" class="swal2-input" placeholder="Año" value="${v.anio}">` +
        `<select id="disp" class="swal2-input">
           <option value="true" ${v.disponible ? 'selected' : ''}>Disponible</option>
           <option value="false" ${!v.disponible ? 'selected' : ''}>No disponible</option>
         </select>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const marca = (document.getElementById('marca') as HTMLInputElement).value.trim();
        const modelo = (document.getElementById('modelo') as HTMLInputElement).value.trim();
        const anio = Number((document.getElementById('anio') as HTMLInputElement).value);
        const disponible = (document.getElementById('disp') as HTMLSelectElement).value === 'true';
        if (!marca || !modelo || !anio) return null;
        return { marca, modelo, anio, disponible };
      }
    });

    if (!r.value) return;

    await this.api.put(`/api/vehiculos/${v.vehiculoId}`, r.value).toPromise();
    await this.cargar();
  }

  async eliminar(v: Vehiculo): Promise<void> {
    const r = await Swal.fire({
      icon: 'warning',
      title: 'Confirmar',
      text: `Eliminar vehículo #${v.vehiculoId}?`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!r.isConfirmed) return;

    await this.api.delete(`/api/vehiculos/${v.vehiculoId}`).toPromise();
    await this.cargar();
  }
}
