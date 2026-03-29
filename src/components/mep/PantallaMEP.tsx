import { useState } from 'react';

// Categorías relevantes para un docente de Educación Religiosa
const CATEGORIAS_RELEVANTES = [
  'Periodos Lectivos',
  'Efemérides y otras celebraciones',
  'Administrativo y docente',
  'Pruebas de Educación Formal',
];

const COLEGIOS = [
  { id: 'ctp', nombre: 'CTP Dos Cercas' },
  { id: 'liceo', nombre: 'Liceo Aserrí' },
  { id: 'panama', nombre: 'República de Panamá' },
  { id: 'pastoral', nombre: 'Pastoral MEP' },
  { id: 'todos', nombre: 'Todos' },
];

interface EventoMEP {
  id: string;
  titulo: string;
  fechaInicio: string;
  fechaFin?: string;
  categoria: string;
  descripcion: string;
  colegio: string;
  destacado: boolean;
}

const EVENTOS_BASE: EventoMEP[] = [
  { id: '1', titulo: 'Inicio de lecciones 2026', fechaInicio: '2026-02-23', categoria: 'Periodos Lectivos', descripcion: 'Fecha de inicio de las lecciones del curso lectivo 2026.', colegio: 'todos', destacado: true },
  { id: '2', titulo: 'I Periodo Lectivo 2026', fechaInicio: '2026-02-23', fechaFin: '2026-07-03', categoria: 'Periodos Lectivos', descripcion: 'I periodo lectivo para Educación General Básica y Diversificada.', colegio: 'todos', destacado: true },
  { id: '3', titulo: 'Semana Santa', fechaInicio: '2026-03-29', fechaFin: '2026-04-05', categoria: 'Periodos Lectivos', descripcion: 'Periodo de reflexión referido a la conmemoración cristiana a la Pasión de Cristo.', colegio: 'todos', destacado: true },
  { id: '4', titulo: 'Semana Nacional de Educación Religiosa', fechaInicio: '2026-05-31', fechaFin: '2026-06-06', categoria: 'Efemérides y otras celebraciones', descripcion: 'Semana para fortalecer la dimensión religiosa y espiritual del estudiantado.', colegio: 'todos', destacado: true },
  { id: '5', titulo: 'Vacaciones de medio periodo', fechaInicio: '2026-07-06', fechaFin: '2026-07-17', categoria: 'Periodos Lectivos', descripcion: 'Periodo de descanso vacacional.', colegio: 'todos', destacado: true },
  { id: '6', titulo: 'II Periodo Lectivo 2026', fechaInicio: '2026-07-20', fechaFin: '2026-12-09', categoria: 'Periodos Lectivos', descripcion: 'II periodo lectivo para Educación General Básica y Diversificada.', colegio: 'todos', destacado: true },
  { id: '7', titulo: 'Semana Cívica', fechaInicio: '2026-09-09', fechaFin: '2026-09-15', categoria: 'Efemérides y otras celebraciones', descripcion: 'Celebración de fiestas patrias y fervor cívico.', colegio: 'todos', destacado: false },
  { id: '8', titulo: 'Independencia de Costa Rica', fechaInicio: '2026-09-15', categoria: 'Efemérides y otras celebraciones', descripcion: 'Conmemoración de la Independencia.', colegio: 'todos', destacado: true },
  { id: '9', titulo: 'Día de las Culturas', fechaInicio: '2026-10-12', categoria: 'Efemérides y otras celebraciones', descripcion: 'Conmemoración del carácter pluricultural y multiétnico costarricense.', colegio: 'todos', destacado: false },
  { id: '10', titulo: 'Cierre del curso lectivo 2026', fechaInicio: '2026-12-09', categoria: 'Periodos Lectivos', descripcion: 'Fecha del fin de las lecciones del curso lectivo 2026.', colegio: 'todos', destacado: true },
  { id: '11', titulo: 'Día del Maestro y la Maestra', fechaInicio: '2026-11-19', categoria: 'Efemérides y otras celebraciones', descripcion: 'Día del Maestro y la Maestra Costarricense.', colegio: 'todos', destacado: false },
  { id: '12', titulo: 'Abolición del Ejército', fechaInicio: '2026-12-01', categoria: 'Efemérides y otras celebraciones', descripcion: 'Día de la Abolición del Ejército - Feriado.', colegio: 'todos', destacado: false },
  { id: '13', titulo: 'Semana de Integración Familiar', fechaInicio: '2026-08-23', fechaFin: '2026-08-29', categoria: 'Efemérides y otras celebraciones', descripcion: 'Semana de Integración Familiar.', colegio: 'todos', destacado: false },
  { id: '14', titulo: 'Capacitación obligatoria nacional', fechaInicio: '2026-02-09', fechaFin: '2026-02-20', categoria: 'Administrativo y docente', descripcion: 'Proceso de formación profesional para personal docente y directivo.', colegio: 'todos', destacado: true },
  { id: '15', titulo: 'Entrega de notas I periodo', fechaInicio: '2026-07-30', fechaFin: '2026-07-31', categoria: 'Administrativo y docente', descripcion: 'Entrega del Informe de Notas del I periodo.', colegio: 'todos', destacado: true },
  { id: '16', titulo: 'Entrega de notas II periodo', fechaInicio: '2026-11-26', fechaFin: '2026-11-27', categoria: 'Administrativo y docente', descripcion: 'Entrega del Informe de Notas del II periodo.', colegio: 'todos', destacado: true },
];

const COLORES_CAT: Record<string, string> = {
  'Periodos Lectivos': '#4a3270',
  'Efemérides y otras celebraciones': '#8a6a1f',
  'Administrativo y docente': '#1a5276',
  'Pruebas de Educación Formal': '#7b241c',
};

function fmtFecha(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtMes(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('es-CR', { month: 'long', year: 'numeric' });
}

function descargarICS(evento: EventoMEP) {
  const inicio = evento.fechaInicio.replace(/-/g, '');
  const fin = evento.fechaFin ? evento.fechaFin.replace(/-/g, '') : inicio;
  // Add 1 day for all-day events in iCal
  const fechaFinICS = evento.fechaFin
    ? (() => { const d = new Date(evento.fechaFin + 'T12:00:00'); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0].replace(/-/g, ''); })()
    : (() => { const d = new Date(evento.fechaInicio + 'T12:00:00'); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0].replace(/-/g, ''); })();

  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lázaro MEP//ES',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${inicio}`,
    `DTEND;VALUE=DATE:${fechaFinICS}`,
    `SUMMARY:${evento.titulo}`,
    `DESCRIPTION:${evento.descripcion.replace(/\n/g, '\\n')}`,
    `CATEGORIES:${evento.categoria}`,
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${evento.titulo.replace(/[^a-z0-9]/gi, '_')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function descargarTodosICS(eventos: EventoMEP[]) {
  const vevents = eventos.map(evento => {
    const inicio = evento.fechaInicio.replace(/-/g, '');
    const fechaFinICS = evento.fechaFin
      ? (() => { const d = new Date(evento.fechaFin + 'T12:00:00'); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0].replace(/-/g, ''); })()
      : (() => { const d = new Date(evento.fechaInicio + 'T12:00:00'); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0].replace(/-/g, ''); })();
    return [
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${inicio}`,
      `DTEND;VALUE=DATE:${fechaFinICS}`,
      `SUMMARY:MEP - ${evento.titulo}`,
      `DESCRIPTION:${evento.descripcion.replace(/\n/g, '\\n')}`,
      `CATEGORIES:${evento.categoria}`,
      'END:VEVENT'
    ].join('\r\n');
  }).join('\r\n');

  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lázaro MEP//ES', vevents, 'END:VCALENDAR'].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'calendario_MEP_2026.ics';
  a.click();
  URL.revokeObjectURL(url);
}

export function PantallaMEP() {
  const [eventos, setEventos] = useState<EventoMEP[]>(EVENTOS_BASE);
  const [filtroColegio, setFiltroColegio] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [soloDestacados, setSoloDestacados] = useState(false);
  const [vistaActiva, setVistaActiva] = useState<'lista' | 'agregar' | 'ia'>('lista');
  const [nuevoEvento, setNuevoEvento] = useState({ titulo: '', fechaInicio: '', fechaFin: '', categoria: 'Periodos Lectivos', colegio: 'todos', descripcion: '', destacado: false });
  const [textoIA, setTextoIA] = useState('');
  const [procesandoIA, setProcesandoIA] = useState(false);
  const [eventosIA, setEventosIA] = useState<EventoMEP[]>([]);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  const eventosFiltrados = eventos
    .filter(e => filtroColegio === 'todos' || e.colegio === filtroColegio || e.colegio === 'todos')
    .filter(e => filtroCategoria === 'todos' || e.categoria === filtroCategoria)
    .filter(e => !soloDestacados || e.destacado)
    .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));

  // Agrupar por mes
  const eventosPorMes: Record<string, EventoMEP[]> = {};
  eventosFiltrados.forEach(e => {
    const mes = e.fechaInicio.slice(0, 7);
    if (!eventosPorMes[mes]) eventosPorMes[mes] = [];
    eventosPorMes[mes].push(e);
  });

  function agregarEvento() {
    if (!nuevoEvento.titulo || !nuevoEvento.fechaInicio) return;
    const nuevo: EventoMEP = {
      id: Date.now().toString(),
      ...nuevoEvento,
    };
    setEventos(prev => [...prev, nuevo]);
    setNuevoEvento({ titulo: '', fechaInicio: '', fechaFin: '', categoria: 'Periodos Lectivos', colegio: 'todos', descripcion: '', destacado: false });
    setVistaActiva('lista');
  }

  function eliminarEvento(id: string) {
    setEventos(prev => prev.filter(e => e.id !== id));
  }

  async function procesarConIA() {
    if (!textoIA.trim()) return;
    setProcesandoIA(true);
    setEventosIA([]);

    try {
      const res = await fetch('/api/mep-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: textoIA }),
      });

      const data = await res.json();

      if (data.error) {
        console.error('Error IA:', data.error);
        setProcesandoIA(false);
        return;
      }

      const nuevos: EventoMEP[] = (data.eventos ?? []).map((e: any, i: number) => ({
        id: `ia_${Date.now()}_${i}`,
        titulo: e.titulo ?? '',
        fechaInicio: e.fechaInicio ?? '',
        fechaFin: e.fechaFin && e.fechaFin !== 'null' ? e.fechaFin : undefined,
        categoria: e.categoria ?? 'Efemérides y otras celebraciones',
        descripcion: e.descripcion ?? '',
        colegio: 'todos',
        destacado: e.destacado ?? false,
      })).filter((e: EventoMEP) => e.titulo && e.fechaInicio);

      setEventosIA(nuevos);
      setSeleccionados(new Set(nuevos.map(e => e.id)));
    } catch (err) {
      console.error('Error IA:', err);
    } finally {
      setProcesandoIA(false);
    }
  }

  function importarSeleccionados() {
    const aImportar = eventosIA.filter(e => seleccionados.has(e.id));
    setEventos(prev => [...prev, ...aImportar]);
    setEventosIA([]);
    setTextoIA('');
    setSeleccionados(new Set());
    setVistaActiva('lista');
  }

  const s: Record<string, React.CSSProperties> = {
    chip: { fontSize: 11, padding: '3px 10px', borderRadius: 20, fontFamily: 'Lato, sans-serif', border: 'none', cursor: 'pointer' },
    btn: { background: '#4a3270', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato, sans-serif' },
    btnGhost: { background: 'transparent', color: '#4a3270', border: '1.5px solid #4a3270', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato, sans-serif' },
    input: { width: '100%', boxSizing: 'border-box' as const, padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e8e0f0', fontSize: 14, fontFamily: 'Lato, sans-serif', outline: 'none' },
    label: { fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#8a7fa0', display: 'block', marginBottom: 5, fontFamily: 'Lato, sans-serif' },
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 16, color: '#1a0f2e', letterSpacing: '0.05em', marginBottom: 2 }}>Calendario MEP 2026</h2>
          <p style={{ fontSize: 12, color: '#8a7fa0', fontFamily: 'Lato, sans-serif' }}>{eventos.length} eventos · {eventosFiltrados.length} visibles</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={s.btnGhost} onClick={() => descargarTodosICS(eventosFiltrados)}>↓ .ics</button>
          <button style={s.btn} onClick={() => setVistaActiva('ia')}>✨ Leer PDF/texto</button>
          <button style={{ ...s.btn, background: '#8a6a1f' }} onClick={() => setVistaActiva('agregar')}>+ Agregar</button>
        </div>
      </div>

      {/* Filtros */}
      {vistaActiva === 'lista' && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <select style={{ ...s.input, width: 'auto', padding: '7px 10px' }} value={filtroColegio} onChange={e => setFiltroColegio(e.target.value)}>
            {COLEGIOS.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <select style={{ ...s.input, width: 'auto', padding: '7px 10px' }} value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
            <option value="todos">Todas las categorías</option>
            {CATEGORIAS_RELEVANTES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            style={{ ...s.chip, background: soloDestacados ? '#4a3270' : '#f0eafa', color: soloDestacados ? '#fff' : '#4a3270' }}
            onClick={() => setSoloDestacados(p => !p)}>
            ⭐ Destacados
          </button>
        </div>
      )}

      {/* Vista: Lista por mes */}
      {vistaActiva === 'lista' && (
        <div>
          {Object.entries(eventosPorMes).map(([mes, evs]) => (
            <div key={mes} style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: 12, color: '#8a6a1f', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                {fmtMes(mes + '-01')}
              </p>
              {evs.map(e => (
                <div key={e.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '10px 12px', borderRadius: 10, marginBottom: 8,
                  background: e.destacado ? '#faf8ff' : '#fff',
                  border: `1.5px solid ${e.destacado ? '#c9b8e8' : '#f0eafa'}`,
                }}>
                  <div style={{ width: 4, minHeight: 36, borderRadius: 4, background: COLORES_CAT[e.categoria] ?? '#999', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {e.destacado && <span style={{ fontSize: 12 }}>⭐</span>}
                      <p style={{ fontFamily: 'Lato, sans-serif', fontSize: 14, fontWeight: 600, color: '#1a0f2e' }}>{e.titulo}</p>
                    </div>
                    <p style={{ fontSize: 12, color: '#8a7fa0', fontFamily: 'Lato, sans-serif', marginTop: 2 }}>
                      {fmtFecha(e.fechaInicio)}{e.fechaFin ? ` → ${fmtFecha(e.fechaFin)}` : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button style={{ ...s.chip, background: '#ede8f5', color: '#4a3270' }} onClick={() => descargarICS(e)} title="Descargar .ics">📅</button>
                    <button style={{ ...s.chip, background: '#fdf0f0', color: '#7b241c' }} onClick={() => eliminarEvento(e.id)} title="Eliminar">×</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
          {eventosFiltrados.length === 0 && (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#8a7fa0', fontFamily: 'EB Garamond, serif', fontStyle: 'italic' }}>
              No hay eventos con esos filtros.
            </p>
          )}
        </div>
      )}

      {/* Vista: Agregar evento */}
      {vistaActiva === 'agregar' && (
        <div style={{ background: '#faf8ff', borderRadius: 14, padding: '1.25rem', border: '1.5px solid #e8e0f0' }}>
          <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: 14, color: '#4a3270', marginBottom: '1rem' }}>Nuevo evento</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={s.label}>Título *</label>
              <input style={s.input} value={nuevoEvento.titulo} onChange={e => setNuevoEvento(p => ({ ...p, titulo: e.target.value }))} placeholder="Nombre del evento" />
            </div>
            <div>
              <label style={s.label}>Fecha inicio *</label>
              <input type="date" style={s.input} value={nuevoEvento.fechaInicio} onChange={e => setNuevoEvento(p => ({ ...p, fechaInicio: e.target.value }))} />
            </div>
            <div>
              <label style={s.label}>Fecha fin (opcional)</label>
              <input type="date" style={s.input} value={nuevoEvento.fechaFin} onChange={e => setNuevoEvento(p => ({ ...p, fechaFin: e.target.value }))} />
            </div>
            <div>
              <label style={s.label}>Categoría</label>
              <select style={s.input} value={nuevoEvento.categoria} onChange={e => setNuevoEvento(p => ({ ...p, categoria: e.target.value }))}>
                {CATEGORIAS_RELEVANTES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Colegio</label>
              <select style={s.input} value={nuevoEvento.colegio} onChange={e => setNuevoEvento(p => ({ ...p, colegio: e.target.value }))}>
                {COLEGIOS.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={s.label}>Descripción</label>
              <textarea style={{ ...s.input, minHeight: 60, resize: 'vertical' as const }} value={nuevoEvento.descripcion} onChange={e => setNuevoEvento(p => ({ ...p, descripcion: e.target.value }))} />
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="dest" checked={nuevoEvento.destacado} onChange={e => setNuevoEvento(p => ({ ...p, destacado: e.target.checked }))} />
              <label htmlFor="dest" style={{ fontFamily: 'Lato, sans-serif', fontSize: 13, color: '#5a4060', cursor: 'pointer' }}>Marcar como destacado ⭐</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: '1rem' }}>
            <button style={s.btn} onClick={agregarEvento} disabled={!nuevoEvento.titulo || !nuevoEvento.fechaInicio}>Guardar evento</button>
            <button style={s.btnGhost} onClick={() => setVistaActiva('lista')}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Vista: Lector IA */}
      {vistaActiva === 'ia' && (
        <div>
          <div style={{ background: '#faf8ff', borderRadius: 14, padding: '1.25rem', border: '1.5px solid #e8e0f0', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: 14, color: '#4a3270', marginBottom: 4 }}>✨ Lector IA de calendario</h3>
            <p style={{ fontSize: 13, color: '#8a7fa0', fontFamily: 'Lato, sans-serif', marginBottom: '1rem' }}>
              Pegá el texto del PDF o de la página web del MEP. La IA va a extraer los eventos relevantes para tus colegios.
            </p>
            <textarea
              value={textoIA}
              onChange={e => setTextoIA(e.target.value)}
              placeholder="Pegá aquí el texto del calendario MEP (podés copiar desde el PDF o la página web)..."
              style={{ ...s.input, minHeight: 160, resize: 'vertical' as const, marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={s.btn} onClick={procesarConIA} disabled={!textoIA.trim() || procesandoIA}>
                {procesandoIA ? 'Procesando...' : '✨ Extraer eventos'}
              </button>
              <button style={s.btnGhost} onClick={() => setVistaActiva('lista')}>Cancelar</button>
            </div>
          </div>

          {/* Resultados IA */}
          {eventosIA.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: '#4a3270' }}>
                  {eventosIA.length} eventos encontrados — seleccioná los que querés importar:
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ ...s.chip, background: '#ede8f5', color: '#4a3270' }}
                    onClick={() => setSeleccionados(new Set(eventosIA.map(e => e.id)))}>Todos</button>
                  <button style={{ ...s.chip, background: '#f0eafa', color: '#8a7fa0' }}
                    onClick={() => setSeleccionados(new Set())}>Ninguno</button>
                </div>
              </div>
              {eventosIA.map(e => (
                <div key={e.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 12px', borderRadius: 10, marginBottom: 8,
                  background: seleccionados.has(e.id) ? '#faf8ff' : '#fff',
                  border: `1.5px solid ${seleccionados.has(e.id) ? '#c9b8e8' : '#e8e0f0'}`,
                  cursor: 'pointer',
                }} onClick={() => setSeleccionados(prev => {
                  const next = new Set(prev);
                  next.has(e.id) ? next.delete(e.id) : next.add(e.id);
                  return next;
                })}>
                  <input type="checkbox" checked={seleccionados.has(e.id)} onChange={() => {}} style={{ marginTop: 3, cursor: 'pointer' }} />
                  <div>
                    <p style={{ fontFamily: 'Lato, sans-serif', fontSize: 13, fontWeight: 600, color: '#1a0f2e' }}>{e.titulo}</p>
                    <p style={{ fontSize: 12, color: '#8a7fa0', fontFamily: 'Lato, sans-serif', marginTop: 2 }}>
                      {fmtFecha(e.fechaInicio)}{e.fechaFin ? ` → ${fmtFecha(e.fechaFin)}` : ''} · {e.categoria}
                    </p>
                  </div>
                </div>
              ))}
              <button style={{ ...s.btn, marginTop: 12 }} onClick={importarSeleccionados} disabled={seleccionados.size === 0}>
                Importar {seleccionados.size} eventos
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
