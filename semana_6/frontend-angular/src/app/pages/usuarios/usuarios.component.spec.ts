import { TestBed } from '@angular/core/testing';
import { UsuariosComponent } from './usuarios.component';

describe('UsuariosComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosComponent],
    }).compileComponents();
  });

  it('debería crear el componente', () => {
    const fixture = TestBed.createComponent(UsuariosComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
