import { useState } from 'react';
import type { TipoLectura, Modalidad } from '../types';

const CAL_API_KEY = import.meta.env.VITE_CAL_API_KEY ?? '';
const CAL_API_BASE = 'https://api.cal.com/v1';

interface CalBooking {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  attendees: { name: string; email: string }[];
  responses?: Record<string, { value: string | string[]; label?: string }>;
}

export interface CitaCalCom {
  calEventId: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteFechaNacimiento: string;
  intencion: string;
  tipo: TipoLectura;
  modalidad: Modalidad;
  fecha: string;
  hora: string;
}

function detectarTipo(duracionMin: number): TipoLectura {
  return duracionMin <= 20 ? 'breve' : 'completa';
}

function detectarModalidad(
  responses: Record<string, { value: string | string[] }> = {}
): Modalidad {
  const todo = JSON.stringify(responses).toLowerCase();
  return todo.includes('virtual') || todo.includes('video') || todo.includes('llamada')
    ? 'virtual'
    : 'presencial';
}

function buscarRespuesta(
  responses: Record<string, { value: string | string[]; label?: string }> = {},
  ...palabrasClave: string[]
): string {
  for (const clave of palabrasClave) {
    const key = Object.keys(responses).find(k =>
      k.toLowerCase().includes(clave.toLowerCase()) ||
      (responses[k].label ?? '').toLowerCase().includes(clave.toLowerCase())
    );
    if (key) {
      const val = responses[key].value;
      return Array.isArray(val) ? val.join(', ') : String(val ?? '');
    }
  }
  return '';
}

export function useCalCom() {
  const [cargando, setCargando] = useState(false);
  const [error, setError]       = useState('');

  async function sincronizar(): Promise<CitaCalCom[]> {
    if (!CAL_API_KEY) {
      setError('Falta VITE_CAL_API_KEY en las variables de entorno de Vercel.');
      return [];
    }

    setCargando(true);
    setError('');

    try {
      const url = `${CAL_API_BASE}/bookings?apiKey=${CAL_API_KEY}&status=upcoming`;
      const res = await fetch(url);

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Cal.com respondió ${res.status}: ${body.slice(0, 120)}`);
      }

      const data = await res.json();
      const lista: CalBooking[] = data.bookings ?? [];

      return lista.map(b => {
        const attendee  = b.attendees?.[0];
        const resp      = b.responses ?? {};
        const inicio    = new Date(b.startTime);
        const fin       = new Date(b.endTime);
        const duracion  = (fin.getTime() - inicio.getTime()) / 60000;

        return {
          calEventId:             String(b.id),
          clienteNombre:          attendee?.name ?? '',
          clienteTelefono:        buscarRespuesta(resp, 'whatsapp', 'telefono', 'phone', 'tel'),
          clienteFechaNacimiento: buscarRespuesta(resp, 'nacimiento', 'birth', 'cumple'),
          intencion:              buscarRespuesta(resp, 'intencion', 'consultar', 'consulta', 'tema'),
          tipo:                   detectarTipo(duracion),
          modalidad:              detectarModalidad(resp),
          fecha:                  inicio.toISOString().split('T')[0],
          hora:                   `${String(inicio.getHours()).padStart(2, '0')}:${String(inicio.getMinutes()).padStart(2, '0')}`,
        };
      });

    } catch (e: any) {
      setError(e.message ?? 'Error al conectar con Cal.com');
      return [];
    } finally {
      setCargando(false);
    }
  }

  return { cargando, error, sincronizar };
}
