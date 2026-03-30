import { useState } from 'react';
import type { TipoLectura, Modalidad } from '../types';

const CAL_API_KEY = import.meta.env.VITE_CAL_API_KEY ?? '';
const CAL_API_BASE = 'https://api.cal.com/v2';

interface CalBooking {
  id: number;
  uid?: string;
  title: string;
  start?: string;
  end?: string;
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
      const url = `${CAL_API_BASE}/bookings?status=upcoming`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${CAL_API_KEY}`, 'cal-api-version': '2024-08-13' } });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Cal.com respondió ${res.status}: ${body.slice(0, 120)}`);
      }

      const data = await res.json();
      const lista: CalBooking[] = data.data ?? data.bookings ?? [];

      return lista.map(b => {
        const attendee  = b.attendees?.[0];
        const resp      = b.responses ?? {};

        // v2 puede devolver 'start'/'end' o 'startTime'/'endTime'
        const startRaw = (b as any).start ?? b.startTime ?? '';
        const endRaw   = (b as any).end   ?? b.endTime   ?? '';

        const inicio = startRaw ? new Date(startRaw) : new Date();
        const fin    = endRaw   ? new Date(endRaw)   : new Date(inicio.getTime() + 60 * 60000);
        const duracion = isNaN(inicio.getTime()) || isNaN(fin.getTime())
          ? 40
          : (fin.getTime() - inicio.getTime()) / 60000;

        const telefono   = resp['attendeePhoneNumber']?.value ?? '';
        const nacimiento = resp['title']?.value ?? '';
        const intencion  = resp['notes']?.value ?? '';

        // Fecha y hora en zona Costa Rica
        const fechaStr = isNaN(inicio.getTime())
          ? startRaw.slice(0, 10)
          : inicio.toLocaleDateString('en-CA', { timeZone: 'America/Costa_Rica' });
        const horaStr = isNaN(inicio.getTime())
          ? '00:00'
          : inicio.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Costa_Rica' });

        return {
          calEventId:             String(b.uid ?? b.id),
          clienteNombre:          attendee?.name ?? '',
          clienteTelefono:        Array.isArray(telefono) ? telefono.join('') : String(telefono),
          clienteFechaNacimiento: Array.isArray(nacimiento) ? nacimiento.join('') : String(nacimiento),
          intencion:              Array.isArray(intencion) ? intencion.join('') : String(intencion),
          tipo:                   detectarTipo(duracion),
          modalidad:              detectarModalidad(resp),
          fecha:                  fechaStr,
          hora:                   horaStr,
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
