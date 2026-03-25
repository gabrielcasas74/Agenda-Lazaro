export type EstadoCliente = 'al_dia' | 'pendiente' | 'atrasado';
export type TipoDeclaracion = 'd101' | 'd104' | 'patente' | 'factura' | 'otro';

export interface ClienteContable {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  email: string;
  honorariosMensuales: number;
  estado: EstadoCliente;
  notas: string;
  declaraciones: DeclaracionCliente[];
  pagos: PagoHonorario[];
  creadoEn: string;
}

export interface DeclaracionCliente {
  id: string;
  clienteId: string;
  tipo: TipoDeclaracion;
  descripcion: string;
  // null = usa fecha estándar de Hacienda, string = fecha personalizada
  fechaPersonalizada: string | null;
  periodicidad: 'mensual' | 'trimestral' | 'anual' | 'unica';
  completada: boolean;
  ultimaCompletada: string | null;
  notas: string;
}

export interface PagoHonorario {
  id: string;
  clienteId: string;
  mes: number;
  anio: number;
  monto: number;
  pagado: boolean;
  fechaPago: string | null;
  notas: string;
}

// Fechas estándar Hacienda CR 2026
export const CALENDARIO_HACIENDA = {
  d104: {
    label: 'D-104 IVA',
    descripcion: 'Vence el día 15 de cada mes siguiente al período',
    dia: 15,
    periodicidad: 'mensual' as const,
  },
  d101: {
    label: 'D-101 Renta',
    descripcion: 'Vence el 15 de marzo de cada año',
    mes: 2, // marzo = índice 2
    dia: 15,
    periodicidad: 'anual' as const,
  },
  patente: {
    label: 'Patente municipal',
    descripcion: 'Varía por municipio — fecha personalizada por cliente',
    periodicidad: 'trimestral' as const,
  },
  factura: {
    label: 'Factura mensual',
    descripcion: 'Factura recurrente mensual al cliente',
    periodicidad: 'mensual' as const,
  },
} as const;

export const TIPO_LABELS: Record<TipoDeclaracion, string> = {
  d101: 'D-101 Renta',
  d104: 'D-104 IVA',
  patente: 'Patente',
  factura: 'Factura mensual',
  otro: 'Otro',
};

export const ESTADO_CONFIG: Record<EstadoCliente, { label: string; color: string; bg: string }> = {
  al_dia:   { label: 'Al día',    color: 'var(--teal)',   bg: 'var(--teal-bg)' },
  pendiente:{ label: 'Pendiente', color: 'var(--gold)',   bg: 'var(--gold-light)' },
  atrasado: { label: 'Atrasado',  color: 'var(--danger)', bg: 'var(--coral-bg)' },
};
