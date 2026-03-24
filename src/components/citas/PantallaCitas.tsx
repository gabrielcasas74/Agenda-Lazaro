import { SincronizarCalCom } from './SincronizarCalCom';
import { useState } from 'react';
import type { Cita } from '../../types';
import type { useLazaroStore } from '../../hooks/useLazaroStore';
import { SERVICIOS } from '../../types';
import { formatColones, formatFecha, formatHora, agruparCitasPorFecha } from '../../utils';
import { NuevaCitaForm } from './NuevaCitaForm';
import { EditarCitaForm } from './EditarCitaForm';

type Store = ReturnType<typeof useLazaroStore>;
type Vista = 'proximas' | 'historial';

export function PantallaCitas({ store }: { store: Store }) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoCita, setEditandoCita] = useState<string | null>(null);
  const [vista, setVista] = useState<Vista>('proximas');
  const stats = store.getStats();

  const citasArr = Array.isArray(store.citas) ? store.citas : [];
  const hoyStr = new Date().toISOString().split('T')[0];

  const proximas = citasArr
    .filter(c => c.estado === 'confirmada' && c.fecha >= hoyStr)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));

  const historial = citasArr
    .filter(c => c.estado === 'completada' || c.fecha < hoyStr)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const citasAgrupadas = agruparCitasPorFecha(proximas);
  const fechas = Object.keys(citasAgrupadas).sort();

  function CitaCard({ cita }: { cita: Cita }) {
    if (editandoCita === cita.id) {
      return (
        <EditarCitaForm
          cita={cita}
          onGuardar={datos => { store.editarCita(cita.id, datos); setEditandoCita(null); }}
          onCancelar={() => setEditandoCita(null)}
        />
      );
    }

    return (
      <div className="cita-card">
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
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" style={{ fontSize: 11 }}
              onClick={() => setEditandoCita(cita.id)}>
              Editar
            </button>
            {cita.estado === 'confirmada' && (
              <button className="btn-ghost" onClick={() => store.completarCita(cita.id)}>
                Marcar completada
              </button>
            )}
            {cita.estado === 'completada' && (
              <span style={{ fontSize: 11, color: 'var(--teal)', letterSpacing: '0.04em' }}>
                Completada
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10, marginBottom: '1.5rem' }}>
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

      {/* Sincronizar Cal.com */}
      <SincronizarCalCom store={store} />

      {/* Sub-nav */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', alignItems: 'center' }}>
        {([
          { id: 'proximas',  label: `Próximas (${proximas.length})` },
          { id: 'historial', label: `Historial (${historial.length})` },
        ] as { id: Vista; label: string }[]).map(tab => (
          <button key={tab.id} onClick={() => setVista(tab.id)} style={{
            fontSize: 12, padding: '5px 14px', borderRadius: 20, border: '1px solid',
            borderColor: vista === tab.id ? 'var(--purple)' : 'var(--border-dim)',
            background: vista === tab.id ? 'var(--purple-bg)' : 'transparent',
            color: vista === tab.id ? 'var(--purple)' : 'var(--text-muted)',
            cursor: 'pointer', fontWeight: vista === tab.id ? 700 : 400,
          }}>
            {tab.label}
          </button>
        ))}
        <button className="btn-ghost" style={{ marginLeft: 'auto', fontSize: 12 }}
          onClick={() => setMostrarForm(v => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Nueva cita'}
        </button>
      </div>

      {mostrarForm && (
        <div style={{ marginBottom: '1.5rem' }}>
          <NuevaCitaForm onGuardar={datos => { store.agregarCita(datos); setMostrarForm(false); }} />
        </div>
      )}

      {/* Próximas */}
      {vista === 'proximas' && (
        <>
          {fechas.length === 0 && (
            <p className="font-serif" style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2.5rem 0', fontStyle: 'italic', fontSize: 16 }}>
              No hay citas próximas registradas.
            </p>
          )}
          {fechas.map(fecha => (
            <div key={fecha} style={{ marginBottom: '1.25rem' }}>
              <p className="section-label">{formatFecha(fecha + 'T12:00:00')}</p>
              {citasAgrupadas[fecha].map(cita => <CitaCard key={cita.id} cita={cita} />)}
            </div>
          ))}
        </>
      )}

      {/* Historial */}
      {vista === 'historial' && (
        <>
          {historial.length === 0 && (
            <p className="font-serif" style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2.5rem 0', fontStyle: 'italic', fontSize: 16 }}>
              Sin historial aún.
            </p>
          )}
          {historial.map(cita => (
            <div key={cita.id} style={{ marginBottom: 8 }}>
              <p className="section-label" style={{ marginBottom: 4 }}>
                {formatFecha(cita.fecha + 'T12:00:00')}
              </p>
              <CitaCard cita={cita} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}
