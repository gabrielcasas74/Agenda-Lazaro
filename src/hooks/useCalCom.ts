import { useEffect, useState } from 'react';
import type { TipoLectura, Modalidad } from '../types';

const CAL_API_KEY = import.meta.env.VITE_CAL_API_KEY ?? '';
const CAL_API_BASE = 'https://api.cal.com/v1';

interface CalBooking {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  attendees: { name: string; email: string; timeZone: string }[];
  responses?: Record<string, { value: string | string[] }>;
  eventType?: { slug: string; length: number };
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

function detectarTipo(duracion: number): TipoLectura {
  return duracion <= 15 ? 'breve' : 'completa';
}

function detectarModalidad(title: string, responses: Record<string, { value: string | string[] }> = {}): Modalidad {
  const loc = JSON.stringify(responses).toLowerCase() + title.toLowerCase();
  return loc.includes('virtual') || loc.includes('video') || loc.includes('llamada') ? 'virtual' : 'presencial';
}

function parsearRespuesta(responses: Record<string, { value: string | string[] }> = {}, campo: string): string {
  // Cal.com usa distintos labels según cómo configuraste las preguntas
  const claves = Object.keys(responses);
  const match = claves.find(k => k.toLowerCase().includes(campo.toLowerCase()));
  if (!match) return '';
  const val = responses[match].value;
  return Array.isArray(val) ? val.join(', ') : String(val ?? '');
}

export function useCalCom() {
  const [bookings, setBookings] = useState<CitaCalCom[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function sincronizar(): Promise<CitaCalCom[]> {
    if (!CAL_API_KEY) {
      setError('Falta la API key de Cal.com. Agregala en Vercel como VITE_CAL_API_KEY.');
      return [];
    }
    setCargando(true);
    setError('');
    try {
      // Trae bookings futuros confirmados
      const res = await fetch(
        `${CAL_API_BASE}/bookings?apiKey=${CAL_API_KEY}&status=accepted&take=50`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (!res.ok) throw new Error(`Cal.com respondió ${res.status}`);
      const data = await res.json();
      const lista: CalBooking[] = data.bookings ?? [];

      const citas: CitaCalCom[] = lista.map(b => {
        const attendee = b.attendees?.[0];
        const resp = b.responses ?? {};
        const inicio = new Date(b.startTime);
        const fin    = new Date(b.endTime);
        const duracion = (fin.getTime() - inicio.getTime()) / 60000;

        return {
          calEventId:             String(b.id),
          clienteNombre:          attendee?.name ?? '',
          clienteTelefono:        parsearRespuesta(resp, 'whatsapp') || parsearRespuesta(resp, 'telefono') || parsearRespuesta(resp, 'phone') || '',
          clienteFechaNacimiento: parsearRespuesta(resp, 'nacimiento') || parsearRespuesta(resp, 'birth') || '',
          intencion:              parsearRespuesta(resp, 'intencion') || parsearRespuesta(resp, 'consultar') || '',
          tipo:                   detectarTipo(duracion),
          modalidad:              detectarModalidad(b.title, resp),
          fecha:                  inicio.toISOString().split('T')[0],
          hora:                   `${String(inicio.getHours()).padStart(2,'0')}:${String(inicio.getMinutes()).padStart(2,'0')}`,
        };
      });

      setBookings(citas);
      return citas;
    } catch (e: any) {
      setError(e.message ?? 'Error al conectar con Cal.com');
      return [];
    } finally {
      setCargando(false);
    }
  }

  return { bookings, cargando, error, sincronizar };
}
