import { useContabilidadStore } from '../../hooks/useContabilidadStore';
import { formatColones } from '../../utils';
import { ESTADO_CONFIG, TIPO_LABELS } from '../../types/contabilidad';
import { descargarICSContable } from '../../utils/contabilidad';

type Store = ReturnType<typeof useContabilidadStore>;

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export function ResumenContable({ store, onVerClientes }: { store: Store; onVerClientes: () => void }) {
  const stats = store.getStats();
  const hoy = new Date();
  const mes = hoy.getMonth();
  const anio = hoy.getFullYear();

  // Pendientes de pago este mes
  const pendientesPago = store.clientes.filter(c => {
    const pago = store.getPagoMes(c.id, mes, anio);
    return !pago?.pagado;
  });

  // Declaraciones próximas (no completadas)
  const decsPendientes = store.declaraciones
    .filter(d => !d.completada)
    .slice(0, 5);

  const lbl = { fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', marginBottom: 8, display: 'block' };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10, marginBottom: '1.5rem' }}>
        {[
          { label: 'Honorarios mes',   value: formatColones(stats.totalHonorarios) },
          { label: 'Cobrado este mes', value: formatColones(stats.pagadosMes) },
          { label: 'Por cobrar',       value: formatColones(stats.pendientesMes) },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value" style={{ fontSize: 17 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Estado clientes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10, marginBottom: '1.5rem' }}>
        {([
          { key: 'al_dia',    valor: stats.alDia },
          { key: 'pendiente', valor: stats.pendientes },
          { key: 'atrasado',  valor: stats.atrasados },
        ] as const).map(({ key, valor }) => (
          <div key={key} style={{
            background: ESTADO_CONFIG[key].bg,
            border: `1px solid ${ESTADO_CONFIG[key].color}30`,
            borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
          }} onClick={onVerClientes}>
            <p style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: ESTADO_CONFIG[key].color, marginBottom: 4 }}>
              {ESTADO_CONFIG[key].label}
            </p>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: ESTADO_CONFIG[key].color }}>{valor}</p>
          </div>
        ))}
      </div>

      {/* Cobros pendientes este mes */}
      {pendientesPago.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={lbl}>Por cobrar — {MESES[mes]} {anio}</span>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 10, padding: '4px 16px' }}>
            {pendientesPago.map((c, i) => (
              <div key={c.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0',
                borderBottom: i < pendientesPago.length - 1 ? '1px solid var(--border-dim)' : 'none',
              }}>
                <div>
                  <p style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{c.nombre}</p>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: ESTADO_CONFIG[c.estado].bg, color: ESTADO_CONFIG[c.estado].color }}>
                    {ESTADO_CONFIG[c.estado].label}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: 14, color: 'var(--gold)' }}>{formatColones(c.honorariosMensuales)}</p>
                  <button
                    className="btn-ghost"
                    style={{ fontSize: 11, marginTop: 4 }}
                    onClick={() => store.togglePago(c.id, mes, anio, c.honorariosMensuales)}
                  >
                    Marcar pagado
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Declaraciones pendientes */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ ...lbl, marginBottom: 0 }}>Declaraciones pendientes</span>
          <button
            className="btn-ghost"
            style={{ fontSize: 11 }}
            onClick={() => {
              const todas = store.declaraciones.filter(d => !d.completada);
              if (todas.length) descargarICSContable(todas, store.clientes);
            }}
          >
            Exportar recordatorios .ics
          </button>
        </div>

        {decsPendientes.length === 0 ? (
          <p className="font-serif" style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 15 }}>
            Sin declaraciones pendientes.
          </p>
        ) : (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 10, padding: '4px 16px' }}>
            {decsPendientes.map((d, i) => {
              const cliente = store.getCliente(d.clienteId);
              return (
                <div key={d.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: i < decsPendientes.length - 1 ? '1px solid var(--border-dim)' : 'none',
                }}>
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {cliente?.nombre ?? '—'} · {TIPO_LABELS[d.tipo]}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.descripcion}</p>
                  </div>
                  <button
                    className="btn-ghost"
                    style={{ fontSize: 11 }}
                    onClick={() => store.marcarDeclaracion(d.id, true)}
                  >
                    Completada
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
