import { useState } from 'react';

const WA_LINK = 'https://wa.me/50660668021';
const CAL_API_KEY = import.meta.env.VITE_CAL_API_KEY ?? '';
const CAL_USERNAME = 'lazaro-tarot';

const SERVICIOS = [
  { id: 'breve', slug: '15minbreve', nombre: 'Consulta rápida', duracion: 15, precio: 8000, descripcion: 'Para una pregunta concreta', icono: '🔮' },
  { id: 'completa', slug: '40min', nombre: 'Lectura completa', duracion: 40, precio: 15000, descripcion: 'Amor, dinero, propósito y bloqueos', icono: '🃏' },
];

const TESTIMONIOS = [
  { texto: 'Muy acertado, lo recomiendo.' },
  { texto: 'Me dio claridad inmediata.' },
  { texto: 'Una experiencia transformadora.' },
];

type Paso = 'hero' | 'servicio' | 'fecha' | 'datos' | 'confirmado';
interface Slot { time: string; }
interface DiaSlots { date: string; slots: Slot[]; }

function Estrellas() {
  return <span style={{ color: '#c9a84c', fontSize: 14 }}>★★★★★</span>;
}

function BtnWA() {
  return (
    <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      background: '#25D366', color: '#fff', borderRadius: 50,
      padding: '12px 24px', fontSize: 14, fontWeight: 700,
      textDecoration: 'none', width: '100%', boxSizing: 'border-box' as const,
      fontFamily: 'Lato, sans-serif',
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.556 4.122 1.528 5.857L0 24l6.335-1.502A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.794 9.794 0 01-5.003-1.374l-.36-.213-3.722.882.938-3.618-.235-.372A9.774 9.774 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
      </svg>
      ¿Tienes dudas? Escríbeme
    </a>
  );
}

function PasoIndicador({ pasoActual }: { pasoActual: Paso }) {
  const pasos = [
    { id: 'servicio', label: 'Servicio' },
    { id: 'fecha', label: 'Fecha' },
    { id: 'datos', label: 'Datos' },
    { id: 'confirmado', label: 'Confirmación' },
  ];
  const idx = pasos.findIndex(p => p.id === pasoActual);
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginBottom: '1.5rem' }}>
      {pasos.map((p, i) => (
        <div key={p.id} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: i <= idx ? '#4a3270' : '#e8e0f0',
              color: i <= idx ? '#fff' : '#9a8fb0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
            }}>
              {i < idx ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 10, color: i <= idx ? '#4a3270' : '#9a8fb0', letterSpacing: '0.04em' }}>{p.label}</span>
          </div>
          {i < pasos.length - 1 && (
            <div style={{ width: 40, height: 2, background: i < idx ? '#4a3270' : '#e8e0f0', marginBottom: 14 }} />
          )}
        </div>
      ))}
    </div>
  );
}

export function Reservar() {
  const [paso, setPaso] = useState<Paso>('hero');
  const [servicioSel, setServicioSel] = useState<typeof SERVICIOS[0] | null>(null);
  const [diaSel, setDiaSel] = useState('');
  const [horaSel, setHoraSel] = useState('');
  const [disponibilidad, setDisponibilidad] = useState<DiaSlots[]>([]);
  const [cargandoSlots, setCargandoSlots] = useState(false);
  const [errorSlots, setErrorSlots] = useState('');
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', nacimiento: '', intencion: '' });
  const [enviando, setEnviando] = useState(false);
  const [errorBooking, setErrorBooking] = useState('');

  // ── Cal.com v2: Slots ─────────────────────────────────────
  async function cargarDisponibilidad(slug: string) {
    setCargandoSlots(true);
    setErrorSlots('');
    setDisponibilidad([]);
    try {
      const hoy = new Date();
      const fin = new Date(hoy);
      fin.setDate(hoy.getDate() + 30);

      const params = new URLSearchParams({
        eventTypeSlug: slug,
        username: CAL_USERNAME,
        start: hoy.toISOString(),
        end: fin.toISOString(),
        timeZone: 'America/Costa_Rica',
      });

      const res = await fetch(
        `https://api.cal.com/v2/slots?${params}`,
        { headers: { 'cal-api-version': '2024-09-04' } }
      );
      const data = await res.json();
      console.log('Slots response:', data);

      const slotsObj = data?.data ?? {};
      const dias: DiaSlots[] = Object.entries(slotsObj)
        .map(([date, arr]: [string, any]) => ({
          date,
          slots: Array.isArray(arr) ? arr.map((s: any) => ({ time: s.start })) : [],
        }))
        .filter(d => d.slots.length > 0)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 7);

      setDisponibilidad(dias);
      if (dias.length === 0) setErrorSlots('Sin espacios disponibles en los próximos 30 días.');
    } catch (e: any) {
      setErrorSlots('Error al cargar disponibilidad. Escríbeme por WhatsApp.');
      console.error('Slots error:', e);
    } finally {
      setCargandoSlots(false);
    }
  }

  // ── Cal.com v2: Crear booking ─────────────────────────────
  async function confirmarCita() {
    if (!servicioSel || !horaSel || !form.nombre || !form.email) return;
    setEnviando(true);
    setErrorBooking('');

    try {
      const body = {
        start: horaSel,
        eventTypeSlug: servicioSel.slug,
        username: CAL_USERNAME,
        attendee: {
          name: form.nombre,
          email: form.email,
          timeZone: 'America/Costa_Rica',
          language: 'es',
        },
        bookingFieldsResponses: {
          ...(form.telefono && { attendeePhoneNumber: form.telefono }),
          ...(form.nacimiento && { title: form.nacimiento }),
          ...(form.intencion && { notes: form.intencion }),
        },
      };

      console.log('Booking body:', JSON.stringify(body, null, 2));

      const res = await fetch('https://api.cal.com/v2/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'cal-api-version': '2024-08-13',
          'Authorization': `Bearer ${CAL_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log('Booking response:', data);

      if (!res.ok || data.status === 'error') {
        setErrorBooking(data?.error?.message ?? 'Error al confirmar. Intentá de nuevo o escribime por WhatsApp.');
        return;
      }

      setPaso('confirmado');
    } catch (e: any) {
      setErrorBooking('Error de conexión. Escribime por WhatsApp.');
      console.error('Booking error:', e);
    } finally {
      setEnviando(false);
    }
  }

  function fmtDia(d: string) {
    return new Date(d + 'T12:00:00').toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  function fmtHora(t: string) {
    return new Date(t).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Costa_Rica' });
  }

  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 20, padding: '1.5rem',
    boxShadow: '0 4px 24px rgba(74,50,112,0.10)',
    maxWidth: 400, margin: '0 auto', width: '100%',
  };
  const btnP: React.CSSProperties = {
    background: '#4a3270', color: '#fff', border: 'none', borderRadius: 50,
    padding: '14px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
    width: '100%', fontFamily: 'Lato, sans-serif',
  };

  // ── HERO ──────────────────────────────────────────────────
  if (paso === 'hero') return (
    <div style={{ minHeight: '100vh', background: '#1a0f2e', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', height: '65vh', overflow: 'hidden' }}>
        <img src="/lazaro-hero.jpg" alt="Lázaro"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(26,15,46,0.2) 0%, rgba(26,15,46,0.85) 100%)' }} />
        <div style={{ position: 'absolute', bottom: '2rem', left: 0, right: 0, padding: '0 1.5rem', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 32, color: '#c9a84c', letterSpacing: '0.1em', marginBottom: 4 }}>LÁZARO</h1>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 11, color: '#c9a84c', letterSpacing: '0.2em', marginBottom: 16 }}>LECTURAS DE TAROT</p>
          <h2 style={{ fontFamily: 'EB Garamond, serif', fontSize: 26, color: '#f5f0e8', fontWeight: 400, lineHeight: 1.3, marginBottom: 8 }}>
            Descubre lo que el Tarot tiene para ti hoy
          </h2>
          <p style={{ fontFamily: 'Lato, sans-serif', fontSize: 14, color: 'rgba(245,240,232,0.75)', marginBottom: 24 }}>
            Amor, dinero, decisiones... respuestas claras en minutos.
          </p>
        </div>
      </div>
      <div style={{ flex: 1, background: '#1a0f2e', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        <button style={{ ...btnP, background: '#c9a84c', color: '#1a0f2e', fontSize: 16, maxWidth: 340 }}
          onClick={() => setPaso('servicio')}>
          📅 Reservar mi lectura
        </button>
        <div style={{ textAlign: 'center' }}>
          {TESTIMONIOS.map((t, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <Estrellas />
              <p style={{ fontFamily: 'EB Garamond, serif', fontStyle: 'italic', fontSize: 15, color: 'rgba(245,240,232,0.8)', margin: '2px 0' }}>"{t.texto}"</p>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 340, width: '100%' }}><BtnWA /></div>
      </div>
    </div>
  );

  // ── LAYOUT COMPARTIDO ─────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f5f0e8', padding: '1rem 1rem 6rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 20, color: '#4a3270', letterSpacing: '0.1em', marginBottom: 2 }}>LÁZARO</h1>
        <p style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: '#8a6a1f', letterSpacing: '0.2em' }}>LECTURAS DE TAROT</p>
      </div>
      {paso !== 'confirmado' && (
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <p style={{ fontFamily: 'Lato, sans-serif', fontSize: 13, color: '#4a3270' }}>📅 Reserva tu lectura</p>
        </div>
      )}
      {paso !== 'confirmado' && <PasoIndicador pasoActual={paso} />}

      {/* ── SERVICIO ── */}
      {paso === 'servicio' && (
        <div style={card}>
          <h2 style={{ fontFamily: 'EB Garamond, serif', fontSize: 22, color: '#1a0f2e', marginBottom: '1.25rem', fontWeight: 400 }}>
            Elige tu tipo de lectura
          </h2>
          {SERVICIOS.map(s => (
            <div key={s.id} onClick={() => setServicioSel(s)} style={{
              border: `2px solid ${servicioSel?.id === s.id ? '#4a3270' : '#e8e0f0'}`,
              borderRadius: 14, padding: '1rem', marginBottom: 12, cursor: 'pointer',
              background: servicioSel?.id === s.id ? '#ede8f5' : '#fff', transition: 'all .15s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <span style={{ fontSize: 28 }}>{s.icono}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: 14, color: '#1a0f2e', marginBottom: 2 }}>
                    {s.nombre} — {s.duracion} min
                  </p>
                  <p style={{ fontFamily: 'Lato, sans-serif', fontSize: 13, color: '#6b4fa0', fontWeight: 700 }}>
                    ₡{s.precio.toLocaleString('es-CR')}
                  </p>
                </div>
              </div>
              <p style={{ fontFamily: 'Lato, sans-serif', fontSize: 13, color: '#5a4060' }}>{s.descripcion}</p>
            </div>
          ))}
          <button style={{ ...btnP, opacity: servicioSel ? 1 : 0.4, marginTop: 8 }}
            disabled={!servicioSel}
            onClick={() => { if (servicioSel) { cargarDisponibilidad(servicioSel.slug); setPaso('fecha'); } }}>
            Elegir esta lectura
          </button>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#8a7fa0', marginTop: 12 }}>🔒 Tu información está protegida y segura.</p>
          <div style={{ marginTop: 12 }}><BtnWA /></div>
        </div>
      )}

      {/* ── FECHA ── */}
      {paso === 'fecha' && (
        <div style={card}>
          <h2 style={{ fontFamily: 'EB Garamond, serif', fontSize: 22, color: '#1a0f2e', marginBottom: '1.25rem', fontWeight: 400 }}>
            Elige día y hora
          </h2>
          {cargandoSlots && (
            <p style={{ textAlign: 'center', color: '#8a7fa0', padding: '2rem 0', fontFamily: 'EB Garamond, serif', fontStyle: 'italic' }}>
              Consultando disponibilidad...
            </p>
          )}
          {!cargandoSlots && errorSlots && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <p style={{ color: '#8a7fa0', fontFamily: 'EB Garamond, serif', fontStyle: 'italic', marginBottom: 16 }}>{errorSlots}</p>
              <BtnWA />
            </div>
          )}
          {!cargandoSlots && !errorSlots && disponibilidad.length > 0 && (
            <>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
                {disponibilidad.map(d => (
                  <div key={d.date} onClick={() => { setDiaSel(d.date); setHoraSel(''); }}
                    style={{
                      flex: '0 0 auto', padding: '10px 14px', borderRadius: 12, textAlign: 'center',
                      cursor: 'pointer', minWidth: 72,
                      background: diaSel === d.date ? '#4a3270' : '#fff',
                      border: `2px solid ${diaSel === d.date ? '#4a3270' : '#e8e0f0'}`,
                    }}>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: diaSel === d.date ? '#c9a84c' : '#8a7fa0', marginBottom: 2 }}>
                      {new Date(d.date + 'T12:00:00').toLocaleDateString('es-CR', { weekday: 'short' }).toUpperCase()}
                    </p>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: 18, color: diaSel === d.date ? '#fff' : '#1a0f2e', fontWeight: 600 }}>
                      {new Date(d.date + 'T12:00:00').getDate()}
                    </p>
                    <p style={{ fontSize: 11, color: diaSel === d.date ? 'rgba(255,255,255,0.7)' : '#8a7fa0', fontFamily: 'Lato, sans-serif' }}>
                      {d.slots.length} esp.
                    </p>
                  </div>
                ))}
              </div>
              {diaSel && (
                <>
                  <div style={{ background: '#faeeda', borderRadius: 10, padding: '8px 12px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>⚡</span>
                    <p style={{ fontSize: 12, color: '#854f0b', fontFamily: 'Lato, sans-serif' }}>
                      {disponibilidad.find(d => d.date === diaSel)?.slots.length} espacios — {fmtDia(diaSel)}
                    </p>
                  </div>
                  <p style={{ fontFamily: 'Lato, sans-serif', fontSize: 12, color: '#8a7fa0', marginBottom: 10 }}>Horas disponibles</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
                    {disponibilidad.find(d => d.date === diaSel)?.slots.map(slot => (
                      <div key={slot.time} onClick={() => setHoraSel(slot.time)}
                        style={{
                          padding: '10px 4px', borderRadius: 10, textAlign: 'center', cursor: 'pointer',
                          background: horaSel === slot.time ? '#4a3270' : '#fff',
                          border: `2px solid ${horaSel === slot.time ? '#4a3270' : '#e8e0f0'}`,
                          fontFamily: 'Lato, sans-serif', fontSize: 13, fontWeight: 500,
                          color: horaSel === slot.time ? '#fff' : '#1a0f2e',
                        }}>
                        {fmtHora(slot.time)}
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: '#8a7fa0', marginBottom: 16 }}>📍 Hora de Costa Rica (GMT-6)</p>
                </>
              )}
            </>
          )}
          <button style={{ ...btnP, opacity: diaSel && horaSel ? 1 : 0.4 }}
            disabled={!diaSel || !horaSel}
            onClick={() => setPaso('datos')}>
            Continuar
          </button>
          <div style={{ marginTop: 12 }}><BtnWA /></div>
        </div>
      )}

      {/* ── DATOS ── */}
      {paso === 'datos' && (
        <div style={card}>
          <h2 style={{ fontFamily: 'EB Garamond, serif', fontSize: 22, color: '#1a0f2e', marginBottom: '1.25rem', fontWeight: 400 }}>
            Tus datos
          </h2>
          <div style={{ background: '#ede8f5', borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: 12, color: '#4a3270', marginBottom: 4 }}>
              {servicioSel?.nombre} — {servicioSel?.duracion} min
            </p>
            <p style={{ fontFamily: 'Lato, sans-serif', fontSize: 13, color: '#5a4060' }}>
              {fmtDia(diaSel)} · {fmtHora(horaSel)}
            </p>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: '#8a6a1f', marginTop: 4 }}>
              ₡{servicioSel?.precio.toLocaleString('es-CR')}
            </p>
          </div>

          {[
            { campo: 'nombre',    label: 'Tu nombre',           placeholder: 'Nombre completo',  type: 'text',  required: true },
            { campo: 'email',     label: 'Correo electrónico',  placeholder: 'tu@correo.com',    type: 'email', required: true },
            { campo: 'telefono',  label: 'WhatsApp (+506)',      placeholder: '8888-8888',        type: 'tel',   required: false },
            { campo: 'nacimiento',label: 'Fecha de nacimiento', placeholder: 'dd/mm/aaaa',       type: 'text',  required: false },
          ].map(f => (
            <div key={f.campo} style={{ marginBottom: 12 }}>
              <label style={{ fontFamily: 'Lato, sans-serif', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#8a7fa0', display: 'block', marginBottom: 5 }}>
                {f.label}{f.required && <span style={{ color: '#9e3030' }}> *</span>}
              </label>
              <input type={f.type} value={(form as any)[f.campo]}
                onChange={e => setForm(p => ({ ...p, [f.campo]: e.target.value }))}
                placeholder={f.placeholder}
                style={{ width: '100%', boxSizing: 'border-box' as const, padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e8e0f0', fontSize: 14, fontFamily: 'Lato, sans-serif', outline: 'none' }} />
            </div>
          ))}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontFamily: 'Lato, sans-serif', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#8a7fa0', display: 'block', marginBottom: 5 }}>
              ¿Sobre qué querés consultar?
            </label>
            <textarea value={form.intencion}
              onChange={e => setForm(p => ({ ...p, intencion: e.target.value }))}
              placeholder="Cuéntame brevemente..."
              style={{ width: '100%', boxSizing: 'border-box' as const, padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e8e0f0', fontSize: 14, fontFamily: 'Lato, sans-serif', minHeight: 70, resize: 'vertical' as const, outline: 'none' }} />
          </div>

          {errorBooking && (
            <p style={{ fontSize: 13, color: '#9e3030', marginBottom: 12, padding: '10px 12px', background: '#fdf0f0', borderRadius: 8 }}>
              {errorBooking}
            </p>
          )}

          <button style={{ ...btnP, opacity: form.nombre && form.email ? 1 : 0.4 }}
disabled={!form.nombre || !form.email || enviando}
            onClick={confirmarCita}>
            {enviando ? 'Confirmando...' : '📅 Confirmar cita'}
          </button>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#8a7fa0', marginTop: 10 }}>
            🔒 Pago solicitado después de confirmar.
          </p>
          <div style={{ marginTop: 12 }}><BtnWA /></div>
        </div>
      )}

      {/* ── CONFIRMADO ── */}
      {paso === 'confirmado' && (
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🃏</div>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: '#4a3270', marginBottom: 8 }}>
            ¡Tu cita ha sido agendada!
          </h2>
          <p style={{ fontFamily: 'Lato, sans-serif', fontSize: 14, color: '#5a4060', marginBottom: 4 }}>
            {fmtDia(diaSel)} • {fmtHora(horaSel)}
          </p>
          <span style={{ display: 'inline-block', background: '#ede8f5', color: '#4a3270', fontSize: 12, padding: '4px 14px', borderRadius: 20, fontFamily: 'Cinzel, serif', marginBottom: 20 }}>
            {servicioSel?.nombre} — {servicioSel?.duracion} min
          </span>
          <p style={{ fontFamily: 'EB Garamond, serif', fontStyle: 'italic', fontSize: 16, color: '#5a4060', marginBottom: 24, lineHeight: 1.6 }}>
            Prepárate con una pregunta clara para aprovechar al máximo tu lectura 🙏✨
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Lectura+de+Tarot+con+Lázaro&dates=${new Date(horaSel).toISOString().replace(/[-:.]/g, '').slice(0, 15)}Z/${new Date(new Date(horaSel).getTime() + (servicioSel?.duracion ?? 15) * 60000).toISOString().replace(/[-:.]/g, '').slice(0, 15)}Z`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', color: '#4a3270', border: '2px solid #4a3270', borderRadius: 50, padding: '12px 24px', fontSize: 14, fontWeight: 700, textDecoration: 'none', fontFamily: 'Lato, sans-serif' }}>
              📅 Agregar a mi calendario
            </a>
            <BtnWA />
          </div>
          <p style={{ fontSize: 12, color: '#8a7fa0', marginTop: 16, fontFamily: 'Lato, sans-serif' }}>
            Te enviaré un recordatorio antes de la cita.
          </p>
          <div style={{ marginTop: 24 }}>
            {TESTIMONIOS.map((t, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <Estrellas />
                <p style={{ fontFamily: 'EB Garamond, serif', fontStyle: 'italic', fontSize: 14, color: '#5a4060', margin: '2px 0' }}>"{t.texto}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: 11, color: '#8a7fa0', letterSpacing: '0.1em', fontFamily: 'Lato, sans-serif' }}>
        LÁZARO · LECTURAS DE TAROT
      </p>
    </div>
  );
}
