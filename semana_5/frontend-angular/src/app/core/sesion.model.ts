export type Rol = 'administrador' | 'supervisor' | 'empleado';

export interface Sesion {
  token: string;
  username: string;
  roles: Rol[];
}
