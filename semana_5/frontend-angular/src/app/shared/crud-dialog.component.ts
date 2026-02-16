import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { CampoForm } from './campo-form.model';

export interface CrudDialogData {
  titulo: string;
  subtitulo?: string;
  campos: CampoForm[];
  valores?: Record<string, any>;
  modo: 'crear' | 'editar';
}

@Component({
  standalone: true,
  selector: 'app-crud-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
  ],
  template: `
  <h2 mat-dialog-title>{{ data.titulo }}</h2>
  <div mat-dialog-content class="dlg">
    <p class="muted" *ngIf="data.subtitulo">{{ data.subtitulo }}</p>

    <form [formGroup]="form" class="grid">
      <ng-container *ngFor="let c of data.campos">
        <ng-container *ngIf="mostrarCampo(c)">
          <mat-form-field appearance="outline" *ngIf="c.tipo !== 'select' && c.tipo !== 'switch'">
            <mat-label>{{ c.label }}</mat-label>
            <input matInput
              [type]="mapTipo(c.tipo)"
              [formControlName]="c.key" />
          </mat-form-field>

          <mat-form-field appearance="outline" *ngIf="c.tipo === 'select'">
            <mat-label>{{ c.label }}</mat-label>
            <mat-select [formControlName]="c.key">
              <mat-option *ngFor="let o of c.opciones ?? []" [value]="o.value">
                {{ o.text }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-slide-toggle *ngIf="c.tipo === 'switch'" [formControlName]="c.key">
            {{ c.label }}
          </mat-slide-toggle>
        </ng-container>
      </ng-container>
    </form>
  </div>

  <div mat-dialog-actions align="end">
    <button mat-button (click)="cerrar()">Cancelar</button>
    <button mat-flat-button color="primary" (click)="guardar()" [disabled]="form.invalid">
      Guardar
    </button>
  </div>
  `,
  styles: [`
    .dlg{ min-width: 520px; max-width: 90vw; }
    .muted{ margin: 0 0 10px; opacity:.75; }
    .grid{ display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 720px){ .grid{ grid-template-columns: 1fr; } }
  `]
})
export class CrudDialogComponent {
  form = this.fb.group({});

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<CrudDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CrudDialogData
  ){
    for (const c of data.campos){
      const v = data.valores?.[c.key] ?? (c.tipo === 'switch' ? false : '');
      const validators = c.requerido ? [Validators.required] : [];
      this.form.addControl(c.key, this.fb.control(v, validators));
    }
  }

  mostrarCampo(c: any): boolean {
    if (this.data.modo === 'editar' && c.ocultarEnEdicion) return false;
    return true;
  }

  mapTipo(t: string): string {
    if (t === 'correo') return 'email';
    if (t === 'numero') return 'number';
    if (t === 'fecha') return 'date';
    if (t === 'password') return 'password';
    return 'text';
  }

  cerrar(){ this.ref.close(null); }

  guardar(){
    if (this.form.invalid) return;
    this.ref.close(this.form.value);
  }
}
