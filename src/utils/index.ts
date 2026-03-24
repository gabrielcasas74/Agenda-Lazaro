// Formato de colones costarricenses
export function formatColones(amount: number): string {
  return `₡${amount.toLocaleString('es-CR')}`;
}

export function formatFecha(isoString: string): string {
  const fecha = new Date(isoString);
  return fecha.toLocaleDateString('es-CR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export function formatFechaCorta(isoString: string): string {
  if (!isoString) return '';
  const fecha = new Date(isoString);
  return fecha.toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatHora(hora: string): string {
  const [h, m] = hora.split(':').map(Number);
  const periodo = h >= 12 ? 'pm' : 'am';
  const hora12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hora12}:${String(m).padStart(2, '0')} ${periodo}`;
}

export function getSigno(fechaNacimiento: string): string {
  if (!fechaNacimiento) return '';
  const fecha = new Date(fechaNacimiento);
  const mes = fecha.getMonth() + 1;
  const dia = fecha.getDate();
  if ((mes === 3 && dia >= 21) || (mes === 4 && dia <= 19)) return 'Aries';
  if ((mes === 4 && dia >= 20) || (mes === 5 && dia <= 20)) return 'Tauro';
  if ((mes === 5 && dia >= 21) || (mes === 6 && dia <= 20)) return 'Géminis';
  if ((mes === 6 && dia >= 21) || (mes === 7 && dia <= 22)) return 'Cáncer';
  if ((mes === 7 && dia >= 23) || (mes === 8 && dia <= 22)) return 'Leo';
  if ((mes === 8 && dia >= 23) || (mes === 9 && dia <= 22)) return 'Virgo';
  if ((mes === 9 && dia >= 23) || (mes === 10 && dia <= 22)) return 'Libra';
  if ((mes === 10 && dia >= 23) || (mes === 11 && dia <= 21)) return 'Escorpio';
  if ((mes === 11 && dia >= 22) || (mes === 12 && dia <= 21)) return 'Sagitario';
  if ((mes === 12 && dia >= 22) || (mes === 1 && dia <= 19)) return 'Capricornio';
  if ((mes === 1 && dia >= 20) || (mes === 2 && dia <= 18)) return 'Acuario';
  return 'Piscis';
}

export function getEdad(fechaNacimiento: string): number {
  if (!fechaNacimiento) return 0;
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

export function getIniciales(nombre: string): string {
  return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export function agruparCitasPorFecha<T extends { fecha: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const fecha = item.fecha.split('T')[0];
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

// ── ARCANO PERSONAL ───────────────────────────────────────────

function sumarCifras(n: number): number {
  return String(n).split('').reduce((acc, d) => acc + parseInt(d), 0);
}

const ARCANOS: Record<number, string> = {
  1: 'El Mago',           2: 'La Sacerdotisa',  3: 'La Emperatriz',
  4: 'El Emperador',      5: 'El Hierofante',   6: 'Los Enamorados',
  7: 'El Carro',          8: 'La Fuerza',       9: 'El Ermitaño',
  10: 'La Rueda',         11: 'La Justicia',    12: 'El Colgado',
  13: 'La Muerte',        14: 'La Templanza',   15: 'El Diablo',
  16: 'La Torre',         17: 'La Estrella',    18: 'La Luna',
  19: 'El Sol',           20: 'El Juicio',      21: 'El Mundo',
  22: 'El Loco',
};

export function calcularArcano(fechaNacimiento: string): { numero: number; nombre: string } {
  if (!fechaNacimiento) return { numero: 0, nombre: '' };
  const fecha = new Date(fechaNacimiento);
  const dia  = sumarCifras(fecha.getDate());
  const mes  = sumarCifras(fecha.getMonth() + 1);
  const anio = sumarCifras(fecha.getFullYear()); // una sola reducción

  let total = dia + mes + anio;
  while (total > 22) total = sumarCifras(total);

  return { numero: total, nombre: ARCANOS[total] ?? '' };
}

// ── ARCHIVO .ICS DE CUMPLEAÑOS ────────────────────────────────

export function descargarICS(nombre: string, fechaNacimiento: string): void {
  if (!fechaNacimiento) return;
  const fecha = new Date(fechaNacimiento);
  const mes   = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia   = String(fecha.getDate()).padStart(2, '0');
  const anioActual = new Date().getFullYear();

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lazaro Tarot//ES',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${anioActual}${mes}${dia}`,
    'RRULE:FREQ=YEARLY',
    `SUMMARY:Cumpleanos de ${nombre}`,
    `DESCRIPTION:Cliente de Lazaro - Lecturas de Tarot`,
    'TRANSP:TRANSPARENT',
    `UID:lazaro-bday-${nombre.replace(/\s/g, '-')}-${mes}${dia}@lazaro-tarot`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `cumpleanos-${nombre.replace(/\s/g, '-')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
