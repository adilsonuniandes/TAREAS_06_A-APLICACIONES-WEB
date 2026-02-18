import { TestBed } from '@angular/core/testing';
import { AsignacionesComponent } from './asignaciones.component';

describe('AsignacionesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignacionesComponent],
    }).compileComponents();
  });

  it('debería crear el componente', () => {
    const fixture = TestBed.createComponent(AsignacionesComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
