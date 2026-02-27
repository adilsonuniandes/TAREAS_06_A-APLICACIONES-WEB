import { TestBed } from '@angular/core/testing';
import { EmpleadosComponent } from './empleados.component';

describe('EmpleadosComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpleadosComponent],
    }).compileComponents();
  });

  it('debería crear el componente', () => {
    const fixture = TestBed.createComponent(EmpleadosComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
