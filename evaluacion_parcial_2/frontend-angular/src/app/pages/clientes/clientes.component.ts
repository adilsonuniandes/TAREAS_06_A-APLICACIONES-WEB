import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ApiService } from '../../core/api.service';

type Cliente = {
  clienteId: number;
  nombre: string;
  apellido: string;
  licencia: string;
  telefono?: string | null;
};

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.cargar();
  }

  async cargar(): Promise<void> {
    this.clientes = await this.api.get<Cliente[]>('/api/clientes').toPromise() as Cliente[];
  }

  async nuevo(): Promise<void> {
    const r = await Swal.fire({
      title: 'Nuevo cliente',
      html:
        '<input id="nombre" class="swal2-input" placeholder="Nombre">' +
        '<input id="apellido" class="swal2-input" placeholder="Apellido">' +
        '<input id="licencia" class="swal2-input" placeholder="Licencia">' +
        '<input id="telefono" class="swal2-input" placeholder="Teléfono">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value.trim();
        const apellido = (document.getElementById('apellido') as HTMLInputElement).value.trim();
        const licencia = (document.getElementById('licencia') as HTMLInputElement).value.trim();
        const telefono = (document.getElementById('telefono') as HTMLInputElement).value.trim();
        if (!nombre || !apellido || !licencia) return null;
        return { nombre, apellido, licencia, telefono: telefono || null };
      }
    });

    if (!r.value) return;

    await this.api.post('/api/clientes', r.value).toPromise();
    await this.cargar();
  }

  async editar(c: Cliente): Promise<void> {
    const r = await Swal.fire({
      title: `Actualizar cliente #${c.clienteId}`,
      html:
        `<input id="nombre" class="swal2-input" placeholder="Nombre" value="${c.nombre}">` +
        `<input id="apellido" class="swal2-input" placeholder="Apellido" value="${c.apellido}">` +
        `<input id="licencia" class="swal2-input" placeholder="Licencia" value="${c.licencia}">` +
        `<input id="telefono" class="swal2-input" placeholder="Teléfono" value="${c.telefono ?? ''}">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value.trim();
        const apellido = (document.getElementById('apellido') as HTMLInputElement).value.trim();
        const licencia = (document.getElementById('licencia') as HTMLInputElement).value.trim();
        const telefono = (document.getElementById('telefono') as HTMLInputElement).value.trim();
        if (!nombre || !apellido || !licencia) return null;
        return { nombre, apellido, licencia, telefono: telefono || null };
      }
    });

    if (!r.value) return;

    await this.api.put(`/api/clientes/${c.clienteId}`, r.value).toPromise();
    await this.cargar();
  }

  async eliminar(c: Cliente): Promise<void> {
    const r = await Swal.fire({
      icon: 'warning',
      title: 'Confirmar',
      text: `Eliminar cliente #${c.clienteId}?`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!r.isConfirmed) return;

    await this.api.delete(`/api/clientes/${c.clienteId}`).toPromise();
    await this.cargar();
  }
}
