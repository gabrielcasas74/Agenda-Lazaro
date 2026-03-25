import type { ClienteContable, DeclaracionCliente } from '../types/contabilidad';
import { TIPO_LABELS } from '../types/contabilidad';

function formatDateICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function crearEventoICS(summary: string, description: string, fecha: Date, uid: string): string {
  const inicio = new Date(fecha);
  inicio.setHours(9, 0, 0, 0);
  const fin = new Date(fecha);
  fin.setHours(10, 0, 0, 0);

  return [
    'BEGIN:VEVENT',
    `DTSTART:${formatDateICS(inicio)}`,
    `DTEND:${formatDateICS(fin)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `UID:${uid}@lazaro-conta`,
    'BEGIN:VALARM',
    'TRIGGER:-P3D',
    'ACTION:DISPLAY',
    `DESCRIPTION:Recordatorio: ${summary}`,
    'END:VALARM',
    'END:VEVENT',
  ].join('\r\n');
}

function descargarICS(eventos: string[], filename: string): void {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lazaro Contabilidad//ES',
    'CALSCALE:GREGORIAN',
    ...eventos,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function descargarICSCliente(cliente: ClienteContable, declaraciones: DeclaracionCliente[]): void {
  const eventos = declaraciones
    .filter(d => !d.completada && d.fechaPersonalizada)
    .map(d => crearEventoICS(
      `${TIPO_LABELS[d.tipo]} — ${cliente.nombre}`,
      d.descripcion,
      new Date(d.fechaPersonalizada! + 'T12:00:00'),
      `${d.id}`
    ));

  if (!eventos.length) {
    alert('No hay declaraciones con fecha personalizada para exportar.');
    return;
  }
  descargarICS(eventos, `recordatorios-${cliente.nombre.replace(/\s/g, '-')}.ics`);
}

export function descargarICSContable(declaraciones: DeclaracionCliente[], clientes: ClienteContable[]): void {
  const eventos = declaraciones
    .filter(d => !d.completada && d.fechaPersonalizada)
    .map(d => {
      const cliente = clientes.find(c => c.id === d.clienteId);
      return crearEventoICS(
        `${TIPO_LABELS[d.tipo]} — ${cliente?.nombre ?? 'Cliente'}`,
        d.descripcion,
        new Date(d.fechaPersonalizada! + 'T12:00:00'),
        `${d.id}`
      );
    });

  if (!eventos.length) {
    alert('No hay declaraciones con fecha personalizada pendientes para exportar.');
    return;
  }
  descargarICS(eventos, 'recordatorios-contables.ics');
}
