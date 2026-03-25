import { useState } from 'react';
import type { ClienteContable, DeclaracionCliente, PagoHonorario } from '../../types/contabilidad';
import { ESTADO_CONFIG, TIPO_LABELS, ESTADO_CONFIG as EC } from '../../types/contabilidad';
import { useContabilidadStore } from '../../hooks/useContabilidadStore';
import { formatColones } from '../../utils';
import { descargarICSCliente } from '../../utils/contabilidad';

type Store = ReturnType<typeof useContabilidadStore>;

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const MESES_FULL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const TIPOS = ['d101','d104','patente','factura','otro'] as const;
const PERIODICIDADES = ['mensual','trimestral','anual','unica'] as const;
const ESTADOS = ['al_dia','pendiente','atrasado'] as const;

interface Props {
  cliente: ClienteContable;
  declaraciones: DeclaracionCliente[];
  pagos: PagoHonorario[];
  store: Store;
  onVolver: () => void;
}

export function FichaClienteContable({ cliente, declaraciones, pagos, store, onVolver }: Props) {
  const hoy = new Date();
  const [anioVista, setAnioVista] = useState(hoy.getFullYear());
  const [mostrarFormDec, setMostrarFormDec] = useState(false);
  const [editandoCliente, setEditandoCliente] = useState(false);
  const [formDec, setFormDec] = useState({ tipo: 'd104' as const, descripcion: '', fechaPersonalizada: '', periodicidad: 'mensual' as const, notas: '' });
  const [formCliente, setFormCliente] = useState({ ...cliente });

  const lbl = { fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', display: 'block', marginBottom: 5 };

  function guardarDec() {
    if (!formDec.descripcion) return;
    store.agregarDeclaracion(cliente.id, {
      tipo: formDec.tipo,
      descripcion: formDec.descripcion,
      fechaPersonalizada: formDec.fechaPersonalizada || null,
      periodicidad: formDec.periodicidad,
      notas: formDec.notas,
    });
    setFormDec({ tipo: 'd104', descripcion: '', fechaPersonalizada: '', periodicidad: 'mensual', notas: '' });
    setMostrarFormDec(false);
  }

  // Grid de honorarios — 12 meses del año
  const mesesAnio = Array.from({ length: 12 }, (_, m) => {
    const pago = store.getPagoMes(cliente.id, m, anioVista);
    return { mes: m, pago, pagado: pago?.pagado ?? false };
  });
  const totalPagadoAnio = mesesAnio.filter(m => m.pagado).reduce((s) => s + cliente.honorariosMensuales, 0);

  return (
    <div>
      <button onClick={onVolver} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', marginBottom: 20 }}>
        ← Volver a clientes
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: '1.25rem' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: EC[cliente.estado].bg, border: `1px solid ${EC[cliente.estado].color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cinzel, serif', fontSize: 13, color: EC[cliente.estado].color, flexShrink: 0 }}>
          {cliente.nombre.slice(0,2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 15, color: 'var(--text-primary)' }}>{cliente.nombre}</h2>
            <button className="btn-ghost" style={{ fontSize: 11, padding: '2px 10px' }} onClick={() => setEditandoCliente(v => !v)}>
              {editandoCliente ? 'Cancelar' : 'Editar'}
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cliente.cedula} · {cliente.telefono}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 14, color: 'var(--gold)' }}>{formatColones(cliente.honorariosMensuales)}/mes</p>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: EC[cliente.estado].bg, color: EC[cliente.estado].color }}>
            {EC[cliente.estado].label}
          </span>
        </div>
      </div>

      {/* Form editar cliente */}
      {editandoCliente && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            {[
              { campo: 'nombre',   label: 'Nombre' },
              { campo: 'cedula',   label: 'Cédula' },
              { campo: 'telefono', label: 'Teléfono' },
              { campo: 'email',    label: 'Correo' },
              { campo: 'honorariosMensuales', label: 'Honorarios (₡)' },
            ].map(f => (
              <div key={f.campo} style={{ marginBottom: 10 }}>
                <label style={lbl}>{f.label}</label>
                <input value={(formCliente as any)[f.campo]} onChange={e => setFormCliente(p => ({...p, [f.campo]: e.target.value}))} type={f.campo === 'honorariosMensuales' ? 'number' : 'text'} />
              </div>
            ))}
            <div style={{ marginBottom: 10 }}>
              <label style={lbl}>Estado</label>
              <select value={formCliente.estado} onChange={e => setFormCliente(p => ({...p, estado: e.target.value as any}))}>
                {ESTADOS.map(s => <option key={s} value={s}>{ESTADO_CONFIG[s].label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={lbl}>Notas</label>
            <textarea value={formCliente.notas} onChange={e => setFormCliente(p => ({...p, notas: e.target.value}))} style={{ minHeight: 56, resize: 'vertical' }} />
          </div>
          <button className="btn-primary" onClick={() => { store.editarCliente(cliente.id, { ...formCliente, honorariosMensuales: Number(formCliente.honorariosMensuales) }); setEditandoCliente(false); }}>
            Guardar cambios
          </button>
        </div>
      )}

      {cliente.notas && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'EB Garamond, serif', fontStyle: 'italic', marginBottom: '1.25rem', borderLeft: '2px solid var(--border)', paddingLeft: 10 }}>
          {cliente.notas}
        </p>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-dim)', margin: '1.25rem 0' }} />

      {/* Honorarios — grid mensual */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={lbl}>Honorarios {anioVista}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Cobrado: <strong style={{ color: 'var(--teal)' }}>{formatColones(totalPagadoAnio)}</strong></span>
          <button className="btn-ghost" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => setAnioVista(y => y-1)}>‹</button>
          <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{anioVista}</span>
          <button className="btn-ghost" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => setAnioVista(y => y+1)}>›</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 6, marginBottom: '1.5rem' }}>
        {mesesAnio.map(({ mes, pagado }) => (
          <div key={mes}
            onClick={() => store.togglePago(cliente.id, mes, anioVista, cliente.honorariosMensuales)}
            style={{
              padding: '8px 4px', borderRadius: 8, textAlign: 'center', cursor: 'pointer',
              background: pagado ? 'var(--teal-bg)' : 'var(--bg-surface)',
              border: `1px solid ${pagado ? 'rgba(42,110,90,0.3)' : 'var(--border-dim)'}`,
              transition: 'all .15s',
            }}>
            <p style={{ fontSize: 10, color: pagado ? 'var(--teal)' : 'var(--text-muted)', marginBottom: 2 }}>{MESES[mes]}</p>
            <p style={{ fontSize: 11, color: pagado ? 'var(--teal)' : 'var(--text-muted)', fontWeight: pagado ? 700 : 400 }}>
              {pagado ? '✓' : '—'}
            </p>
          </div>
        ))}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-dim)', margin: '1.25rem 0' }} />

      {/* Declaraciones */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={lbl}>Declaraciones y obligaciones</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {declaraciones.length > 0 && (
            <button className="btn-ghost" style={{ fontSize: 11 }}
              onClick={() => descargarICSCliente(cliente, declaraciones)}>
              .ics recordatorios
            </button>
          )}
          <button className="btn-ghost" style={{ fontSize: 11 }}
            onClick={() => setMostrarFormDec(v => !v)}>
            {mostrarFormDec ? 'Cancelar' : '+ Agregar'}
          </button>
        </div>
      </div>

      {mostrarFormDec && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div style={{ marginBottom: 10 }}>
              <label style={lbl}>Tipo</label>
              <select value={formDec.tipo} onChange={e => setFormDec(p => ({...p, tipo: e.target.value as any}))}>
                {TIPOS.map(t => <option key={t} value={t}>{TIPO_LABELS[t]}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={lbl}>Periodicidad</label>
              <select value={formDec.periodicidad} onChange={e => setFormDec(p => ({...p, periodicidad: e.target.value as any}))}>
                {PERIODICIDADES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 10, gridColumn: '1 / -1' }}>
              <label style={lbl}>Descripción</label>
              <input value={formDec.descripcion} onChange={e => setFormDec(p => ({...p, descripcion: e.target.value}))} placeholder="Ej: IVA octubre 2026, Renta 2025..." />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={lbl}>Fecha personalizada (opcional)</label>
              <input type="date" value={formDec.fechaPersonalizada} onChange={e => setFormDec(p => ({...p, fechaPersonalizada: e.target.value}))} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={lbl}>Notas</label>
              <input value={formDec.notas} onChange={e => setFormDec(p => ({...p, notas: e.target.value}))} placeholder="Observaciones..." />
            </div>
          </div>
          <button className="btn-primary" onClick={guardarDec} disabled={!formDec.descripcion}>Guardar declaración</button>
        </div>
      )}

      {declaraciones.length === 0 ? (
        <p className="font-serif" style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 15, marginBottom: '1rem' }}>Sin declaraciones registradas.</p>
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 10, padding: '4px 16px' }}>
          {declaraciones.map((d, i) => (
            <div key={d.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
              borderBottom: i < declaraciones.length - 1 ? '1px solid var(--border-dim)' : 'none',
              opacity: d.completada ? 0.5 : 1,
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 2, textDecoration: d.completada ? 'line-through' : 'none' }}>
                  {TIPO_LABELS[d.tipo]} — {d.descripcion}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {d.periodicidad}
                  {d.fechaPersonalizada && ` · vence ${new Date(d.fechaPersonalizada+'T12:00:00').toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn-ghost" style={{ fontSize: 11 }}
                  onClick={() => store.marcarDeclaracion(d.id, !d.completada)}>
                  {d.completada ? 'Reabrir' : 'Completada'}
                </button>
                <button className="btn-ghost" style={{ fontSize: 11, color: 'var(--danger)', borderColor: 'rgba(158,48,48,0.2)' }}
                  onClick={() => { if (confirm('¿Eliminar esta declaración?')) store.eliminarDeclaracion(d.id); }}>
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
