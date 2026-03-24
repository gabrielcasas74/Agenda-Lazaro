import { useState } from 'react';
import type { useLazaroStore } from '../../hooks/useLazaroStore';
import { SERVICIOS } from '../../types';
import { formatColones, formatFecha, formatHora, agruparCitasPorFecha } from '../../utils';
import { NuevaCitaForm } from './NuevaCitaForm';

type Store = ReturnType<typeof useLazaroStore>;

export function PantallaCitas({ store }: { store: Store }) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const stats = store.getStats();

  const citasAgrupadas = agruparCitasPorFecha(stats.proximasCitas);
  const fechas = Object.keys(citasAgrupadas).sort();

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '10px', marginBottom: '1.5rem' }}>
        {[
          { label: 'Esta semana', value: stats.citasSemana },
          { label: 'Este mes', value: stats.citasMes },
          { label: 'Ingresos mes', value: formatColones(stats.ingresosMes) },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--color-background-secondary)', borderRadius: '8px', padding: '12px 14px' }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>{s.label}</p>
            <p style={{ fontSize: '22px', fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Botón nueva cita manual */}
      <button
        onClick={() => setMostrarForm(!mostrarForm)}
        style={{
          width: '100%', padding: '9px', marginBottom: '1.25rem',
          borderRadius: '8px', border: '0.5px solid #993C1D',
          background: mostrarForm ? '#F0997B' : '#FAECE7',
          color: '#712B13', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
        }}
      >
        {mostrarForm ? 'Cancelar' : '+ Registrar cita manualmente'}
      </button>

      {mostrarForm && (
        <div style={{ marginBottom: '1.5rem' }}>
          <NuevaCitaForm
            onGuardar={(datos) => {
              store.agregarCita(datos);
              setMostrarForm(false);
            }}
          />
        </div>
      )}

      {/* Lista de próximas citas */}
      {fechas.length === 0 && (
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
          No hay citas próximas registradas.
        </p>
      )}

      {fechas.map(fecha => (
        <div key={fecha}>
          <p style={{
            fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)',
            textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 10px',
          }}>
            {formatFecha(fecha + 'T12:00:00')}
          </p>

          {citasAgrupadas[fecha].map(cita => (
            <div
              key={cita.id}
              style={{
                background: 'var(--color-background-primary)',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: '10px', padding: '12px 14px', marginBottom: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {cita.clienteNombre}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{
                    fontSize: '11px', padding: '3px 10px', borderRadius: '12px', fontWeight: 500,
                    background: cita.modalidad === 'presencial' ? '#FAECE7' : '#E1F5EE',
                    color: cita.modalidad === 'presencial' ? '#712B13' : '#085041',
                  }}>
                    {cita.modalidad === 'presencial' ? 'Presencial' : 'Virtual'}
                  </span>
                  <span style={{
                    fontSize: '11px', padding: '3px 10px', borderRadius: '12px', fontWeight: 500,
                    background: cita.tipo === 'breve' ? '#EEEDFE' : '#FAEEDA',
                    color: cita.tipo === 'breve' ? '#3C3489' : '#633806',
                  }}>
                    {SERVICIOS[cita.tipo].nombre} · {SERVICIOS[cita.tipo].duracion} min
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>
                {formatHora(cita.hora)} · {cita.clienteFechaNacimiento} · {cita.clienteTelefono}
              </p>
              {cita.intencion && (
                <p style={{
                  fontSize: '12px', color: 'var(--color-text-secondary)', margin: '6px 0 0',
                  fontStyle: 'italic', borderLeft: '2px solid var(--color-border-secondary)',
                  paddingLeft: '8px', lineHeight: 1.5,
                }}>
                  "{cita.intencion}"
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {formatColones(cita.precio)}
                </span>
                <button
                  onClick={() => store.completarCita(cita.id)}
                  style={{
                    fontSize: '12px', padding: '4px 12px', borderRadius: '6px',
                    border: '0.5px solid var(--color-border-secondary)',
                    background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer',
                  }}
                >
                  Marcar completada
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
