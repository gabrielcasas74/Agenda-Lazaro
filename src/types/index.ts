export type Modalidad = 'presencial' | 'virtual';
export type TipoLectura = 'breve' | 'completa';
export type EstadoCita = 'confirmada' | 'completada' | 'cancelada';

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  fechaNacimiento: string;
  modalidadUsual: Modalidad;
  intereses: string[];
  nombresImportantes: string[];
  productosTrabajos: string[];
  creadoEn: string;
  totalCitas: number;
  totalIngresos: number;
}

export interface NotaSesion {
  id: string;
  citaId: string;
  clienteId: string;
  fecha: string;
  texto: string;
  creadaEn: string;
}

export interface Cita {
  id: string;
  clienteId: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteFechaNacimiento: string;
  tipo: TipoLectura;
  modalidad: Modalidad;
  fecha: string;
  hora: string;
  intencion: string;
  estado: EstadoCita;
  precio: number;
  notas: NotaSesion[];
  creadaEn: string;
  // datos que vienen de Cal.com
  calEventId?: string;
}

export interface AppState {
  clientes: Cliente[];
  citas: Cita[];
  notas: NotaSesion[];
}

// Catálogo de servicios
export const SERVICIOS = {
  breve: {
    nombre: 'Lectura breve',
    duracion: 15,
    precio: 8000,
  },
  completa: {
    nombre: 'Lectura completa',
    duracion: 40,
    precio: 15000,
  },
} as const;

export const CAL_USERNAME = 'lazaro-tarot';
