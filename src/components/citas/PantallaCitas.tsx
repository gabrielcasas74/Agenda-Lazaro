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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10, marginBottom: '1.75rem' }}>
        {[
          { label: 'Esta semana', value: stats.citasSemana },
          { label: 'Este mes',    value: stats.citasMes },
          { label: 'Ingresos',   value: formatColones(stats.ingresosMes) },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Botón nueva cita */}
      <button className="btn-primary" style={{ marginBottom: '1.5rem' }} onClick={() => setMostrarForm(v => !v)}>
        {mostrarForm ? 'Cancelar' : '+ Registrar cita manualmente'}
      </button>

      {mostrarForm && (
        <div style={{ marginBottom: '1.5rem' }}>
          <NuevaCitaForm onGuardar={datos => { store.agregarCita(datos); setMostrarForm(false); }} />
        </div>
      )}

      {/* Lista */}
      {fechas.length === 0 && (
        <p className="font-serif" style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2.5rem 0', fontStyle: 'italic', fontSize: 16 }}>
          No hay citas próximas registradas.
        </p>
      )}

      {fechas.map(fecha => (
        <div key={fecha} style={{ marginBottom: '1.25rem' }}>
          <p className="section-label" style={{ marginBottom: 10 }}>
            {formatFecha(fecha + 'T12:00:00')}
          </p>
          {citasAgrupadas[fecha].map(cita => (
            <div key={cita.id} className="cita-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 14, color: 'var(--text-primary)', letterSpacing: '0.03em' }}>
                  {cita.clienteNombre}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className={`badge badge-${cita.modalidad}`}>
                    {cita.modalidad === 'presencial' ? 'Presencial' : 'Virtual'}
                  </span>
                  <span className={`badge badge-${cita.tipo}`}>
                    {SERVICIOS[cita.tipo].nombre} · {SERVICIOS[cita.tipo].duracion} min
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>
                {formatHora(cita.hora)} · {cita.clienteFechaNacimiento} · {cita.clienteTelefono}
              </p>
              {cita.intencion && (
                <p className="intencion">"{cita.intencion}"</p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: 'var(--gold)' }}>
                  {formatColones(cita.precio)}
                </span>
                <button className="btn-ghost" onClick={() => store.completarCita(cita.id)}>
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
