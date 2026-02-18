import { TestBed } from '@angular/core/testing';
import { DepartamentosComponent } from './departamentos.component';

describe('DepartamentosComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartamentosComponent],
    }).compileComponents();
  });

  it('debería crear el componente', () => {
    const fixture = TestBed.createComponent(DepartamentosComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
