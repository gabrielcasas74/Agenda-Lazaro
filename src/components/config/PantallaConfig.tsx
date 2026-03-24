import { useState } from 'react';
import { CAL_USERNAME, SERVICIOS } from '../../types';

export function PantallaConfig() {
  const [copiado, setCopiado] = useState(false);
  const calUrl = `cal.com/${CAL_USERNAME}`;

  function copiar() {
    navigator.clipboard.writeText(`https://${calUrl}`).then(() => {
      setCopiado(true); setTimeout(() => setCopiado(false), 2000);
    });
  }

  const lbl = { fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', marginBottom: 8, display: 'block' };

  return (
    <div>
      <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: '1.5rem', fontStyle: 'italic', lineHeight: 1.7 }}>
        Este es el link que enviás a tus clientes. Ellos eligen el tipo de lectura, la fecha disponible y llenan el formulario solos.
      </p>

      <span style={lbl}>Tu link de agendamiento</span>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--gold)' }}>{calUrl}</span>
        <button className="btn-ghost" onClick={copiar} style={{ color: copiado ? 'var(--teal)' : undefined }}>
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      </div>

      <div className="divider" />

      <span style={lbl}>Servicios configurados</span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1.5rem' }}>
        {(Object.entries(SERVICIOS) as [string, typeof SERVICIOS[keyof typeof SERVICIOS]][]).map(([key, s]) => (
          <div key={key} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 10, padding: '14px 16px' }}>
            <span className={`badge badge-${key}`} style={{ marginBottom: 10, display: 'inline-block' }}>
              {key === 'breve' ? 'Breve' : 'Completa'}
            </span>
            <p className="font-display" style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>{s.duracion} minutos</p>
            <p className="font-display" style={{ fontSize: 14, color: 'var(--gold)', marginBottom: 4 }}>₡{s.precio.toLocaleString('es-CR')}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Presencial sáb · Virtual 6–9 pm</p>
          </div>
        ))}
      </div>

      <div className="divider" />

      <span style={lbl}>Disponibilidad</span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { label: 'Presencial', dia: 'Sábados', detalle: 'Todo el día · sin límite' },
          { label: 'Virtual',    dia: 'Lun – Vie', detalle: '6:00 pm – 9:00 pm' },
        ].map(d => (
          <div key={d.label} className="stat-card">
            <p className="stat-label">{d.label}</p>
            <p className="font-display" style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 2 }}>{d.dia}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.detalle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
