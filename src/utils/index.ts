// Formato de colones costarricenses
export function formatColones(amount: number): string {
  return `₡${amount.toLocaleString('es-CR')}`;
}

// Formato de fecha legible en español
export function formatFecha(isoString: string): string {
  const fecha = new Date(isoString);
  return fecha.toLocaleDateString('es-CR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatFechaCorta(isoString: string): string {
  const fecha = new Date(isoString);
  return fecha.toLocaleDateString('es-CR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatHora(hora: string): string {
  // hora viene como "14:30", devuelve "2:30 pm"
  const [h, m] = hora.split(':').map(Number);
  const periodo = h >= 12 ? 'pm' : 'am';
  const hora12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hora12}:${String(m).padStart(2, '0')} ${periodo}`;
}

// Signo zodiacal desde fecha de nacimiento
export function getSigno(fechaNacimiento: string): string {
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
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

// Iniciales para avatar
export function getIniciales(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

// Agrupa citas por fecha para la vista de agenda
export function agruparCitasPorFecha<T extends { fecha: string }>(
  items: T[]
): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const fecha = item.fecha.split('T')[0];
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
