export type TipoCampo = 'texto' | 'correo' | 'numero' | 'fecha' | 'select' | 'password' | 'switch';

export interface OpcionSelect {
  value: any;
  text: string;
}

export interface CampoForm {
  key: string;
  label: string;
  tipo: TipoCampo;
  requerido?: boolean;
  opciones?: OpcionSelect[];
  ocultarEnEdicion?: boolean; // para password si quieres
}
