import { useState } from 'react';
import { CAL_USERNAME, SERVICIOS } from '../../types';

export function PantallaConfig() {
  const [copiado, setCopiado] = useState(false);
  const calUrl = `cal.com/${CAL_USERNAME}`;

  function copiarLink() {
    navigator.clipboard.writeText(`https://${calUrl}`).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  return (
    <div>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Este es el link que enviás a tus clientes. Ellos eligen el tipo de lectura, la fecha disponible y llenan el formulario solos.
      </p>

      {/* Link box */}
      <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 8px' }}>
        Tu link de agendamiento
      </p>
      <div style={{
        background: 'var(--color-background-secondary)', borderRadius: '8px',
        padding: '12px 16px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '1.5rem',
      }}>
        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
          {calUrl}
        </span>
        <button
          onClick={copiarLink}
          style={{
            fontSize: '12px', padding: '4px 12px', borderRadius: '6px',
            border: '0.5px solid var(--color-border-secondary)',
            background: copiado ? '#E1F5EE' : 'transparent',
            color: copiado ? '#085041' : 'var(--color-text-secondary)',
            cursor: 'pointer',
          }}
        >
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      </div>

      <hr style={{ border: 'none', borderTop: '0.5px solid var(--color-border-tertiary)', margin: '1.25rem 0' }} />

      {/* Servicios */}
      <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 12px' }}>
        Servicios configurados
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.5rem' }}>
        {(Object.entries(SERVICIOS) as [string, typeof SERVICIOS[keyof typeof SERVICIOS]][]).map(([key, s]) => (
          <div key={key} style={{
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: '12px', padding: '12px 16px',
          }}>
            <span style={{
              fontSize: '11px', padding: '3px 10px', borderRadius: '12px', fontWeight: 500,
              display: 'inline-block', marginBottom: '8px',
              background: key === 'breve' ? '#EEEDFE' : '#FAEEDA',
              color: key === 'breve' ? '#3C3489' : '#633806',
            }}>
              {key === 'breve' ? 'Breve' : 'Completa'}
            </span>
            <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>
              {s.duracion} minutos
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>
              ₡{s.precio.toLocaleString('es-CR')}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
              Presencial sáb · Virtual 6–9 pm
            </p>
          </div>
        ))}
      </div>

      <hr style={{ border: 'none', borderTop: '0.5px solid var(--color-border-tertiary)', margin: '1.25rem 0' }} />

      {/* Disponibilidad */}
      <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 12px' }}>
        Disponibilidad configurada
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.5rem' }}>
        {[
          { label: 'Presencial', dia: 'Sábados', detalle: 'Todo el día · sin límite' },
          { label: 'Virtual', dia: 'Lun – Vie', detalle: '6:00 pm – 9:00 pm' },
        ].map(item => (
          <div key={item.label} style={{ background: 'var(--color-background-secondary)', borderRadius: '8px', padding: '12px 14px' }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>{item.label}</p>
            <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 2px' }}>{item.dia}</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>{item.detalle}</p>
          </div>
        ))}
      </div>

      {/* Nota sobre username */}
      <div style={{
        background: '#FAEEDA', border: '0.5px solid #EF9F27',
        borderRadius: '8px', padding: '12px 14px',
      }}>
        <p style={{ fontSize: '13px', color: '#633806', margin: 0, lineHeight: 1.6 }}>
          Cuando tengas tu username de Cal.com, cambiá el valor de <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>CAL_USERNAME</code> en{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>src/types/index.ts</code>.
        </p>
      </div>
    </div>
  );
}
