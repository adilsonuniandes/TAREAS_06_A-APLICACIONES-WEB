import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import Swal from 'sweetalert2';

import { CampoForm } from './campo-form.model';
import { CrudDialogComponent } from './crud-dialog.component';
import { SesionService } from '../core/sesion.service';

export interface CrudConfig<T> {
  titulo: string;
  subtitulo: string;
  idKey: keyof T;
  columnas: { key: keyof T | string; label: string; render?: (row: T) => string }[];
  camposCrear: CampoForm[];
  camposEditar?: CampoForm[];
  cargar: () => Promise<T[]>;
  crear: (payload: any) => Promise<void>;
  actualizar: (id: any, payload: any) => Promise<void>;
  eliminar: (id: any) => Promise<void>;
  ver?: (row: T) => string; // html
}

@Component({
  standalone: true,
  selector: 'app-crud-tabla',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
  <div class="top">
    <div class="head">
      <h2>{{ config.titulo }}</h2>
      <div class="muted">{{ config.subtitulo }}</div>
    </div>

    <div class="actions">
      <mat-form-field appearance="outline" class="buscador">
        <mat-label>Buscar</mat-label>
        <input matInput (input)="onBuscar($any($event.target).value)" placeholder="Escriba para filtrar..." />
      </mat-form-field>

      <button mat-stroked-button (click)="refrescar()">Refrescar</button>

      <button mat-flat-button color="primary" (click)="nuevo()" *ngIf="puedeEscribir">
        Nuevo
      </button>
    </div>
  </div>

  <div class="card">
    <table mat-table [dataSource]="pagina" class="tabla">

      <ng-container *ngFor="let c of config.columnas" [matColumnDef]="c.key as string">
        <th mat-header-cell *matHeaderCellDef>{{ c.label }}</th>
        <td mat-cell *matCellDef="let row">
          {{ c.render ? c.render(row) : (row as any)[c.key] }}
        </td>
      </ng-container>

      <ng-container matColumnDef="acciones">
        <th mat-header-cell *matHeaderCellDef>Acciones</th>
        <td mat-cell *matCellDef="let row" class="acciones">
          <button mat-stroked-button (click)="ver(row)">Ver</button>
          <button mat-stroked-button (click)="editar(row)" *ngIf="puedeEscribir">Editar</button>
          <button mat-flat-button color="warn" (click)="borrar(row)" *ngIf="puedeEliminar">Eliminar</button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayed"></tr>
      <tr mat-row *matRowDef="let row; columns: displayed;"></tr>
    </table>

    <mat-paginator
      [length]="filtrada.length"
      [pageSize]="pageSize"
      [pageSizeOptions]="[5,10,15,20,50]"
      (page)="onPage($event)">
    </mat-paginator>
  </div>
  `,
  styles: [`
    .top{ display:flex; justify-content:space-between; gap:16px; align-items:flex-end; flex-wrap:wrap; }
    .head h2{ margin:0; font-weight:650; }
    .muted{ opacity:.75; }
    .actions{ display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap; }
    .buscador{ width: 320px; }
    .card{ margin-top:14px; border:1px solid rgba(0,0,0,.08); border-radius:14px; overflow:hidden; }
    .tabla{ width:100%; }
    .acciones{ display:flex; gap:8px; flex-wrap:wrap; }
  `]
})
export class CrudTablaComponent<T extends Record<string, any>> implements OnInit {
  @Input({ required: true }) config!: CrudConfig<T>;

  lista: T[] = [];
  filtrada: T[] = [];
  pagina: T[] = [];

  filtro = '';
  pageIndex = 0;
  pageSize = 10;

  get displayed() {
    return [...this.config.columnas.map(c => c.key as string), 'acciones'];
  }

  get puedeEscribir(){ return this.sesion.puedeEscribir(); }
  get puedeEliminar(){ return this.sesion.puedeEliminar(); }

  constructor(private dialog: MatDialog, private sesion: SesionService){}

  async ngOnInit() {
    await this.refrescar();
  }

  async refrescar(){
    try{
      this.lista = await this.config.cargar();
      this.aplicarFiltroYPaginacion();
    }catch(e: any){
      await Swal.fire({ icon:'error', title:'Error', text: String(e?.message ?? e) });
    }
  }

  onBuscar(valor: string){
    this.filtro = (valor ?? '').trim().toLowerCase();
    this.pageIndex = 0;
    this.aplicarFiltroYPaginacion();
  }

  onPage(ev: PageEvent){
    this.pageIndex = ev.pageIndex;
    this.pageSize = ev.pageSize;
    this.aplicarFiltroYPaginacion();
  }

  aplicarFiltroYPaginacion(){
    const f = this.filtro;
    this.filtrada = !f
      ? [...this.lista]
      : this.lista.filter(x => JSON.stringify(x).toLowerCase().includes(f));

    const start = this.pageIndex * this.pageSize;
    const end = Math.min(start + this.pageSize, this.filtrada.length);
    this.pagina = this.filtrada.slice(start, end);
  }

  async ver(row: T){
    const html = this.config.ver
      ? this.config.ver(row)
      : `<pre style="text-align:left; white-space:pre-wrap; margin:0;">${this.escapeHtml(JSON.stringify(row, null, 2))}</pre>`;

    await Swal.fire({ icon:'info', title:'Detalle', html });
  }

  async nuevo(){
    const ref = this.dialog.open(CrudDialogComponent, {
      data: { titulo: `Nuevo registro`, subtitulo: 'Complete la información.', campos: this.config.camposCrear, modo: 'crear' },
    });

    const res = await ref.afterClosed().toPromise();
    if(!res) return;

    try{
      await this.config.crear(res);
      await Swal.fire({ icon:'success', title:'Creado', text:'Registro creado correctamente.' });
      await this.refrescar();
    }catch(e: any){
      await Swal.fire({ icon:'error', title:'Error', text: String(e?.message ?? e) });
    }
  }

  async editar(row: T){
    const id = row[this.config.idKey as string];
    const campos = this.config.camposEditar ?? this.config.camposCrear;

    const ref = this.dialog.open(CrudDialogComponent, {
      data: { titulo: `Editar #${id}`, subtitulo: 'Actualice la información.', campos, valores: row, modo: 'editar' },
    });

    const res = await ref.afterClosed().toPromise();
    if(!res) return;

    try{
      await this.config.actualizar(id, res);
      await Swal.fire({ icon:'success', title:'Actualizado', text:'Registro actualizado correctamente.' });
      await this.refrescar();
    }catch(e: any){
      await Swal.fire({ icon:'error', title:'Error', text: String(e?.message ?? e) });
    }
  }

  async borrar(row: T){
    const id = row[this.config.idKey as string];
    const r = await Swal.fire({
      icon:'warning',
      title:'Confirmar eliminación',
      text:`¿Eliminar el registro #${id}?`,
      showCancelButton:true,
      confirmButtonText:'Sí, eliminar',
      cancelButtonText:'Cancelar',
    });

    if(!r.isConfirmed) return;

    try{
      await this.config.eliminar(id);
      await Swal.fire({ icon:'success', title:'Eliminado', text:'Registro eliminado correctamente.' });
      await this.refrescar();
    }catch(e: any){
      await Swal.fire({ icon:'error', title:'Error', text: String(e?.message ?? e) });
    }
  }

  escapeHtml(s: string){
    return String(s ?? '')
      .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
      .replaceAll('"','&quot;').replaceAll("'","&#039;");
  }
}
