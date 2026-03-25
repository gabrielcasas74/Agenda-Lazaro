import { useState } from 'react';
import { useContabilidadStore } from '../../hooks/useContabilidadStore';
import { formatColones } from '../../utils';
import { ESTADO_CONFIG } from '../../types/contabilidad';

type Store = ReturnType<typeof useContabilidadStore>;

const ESTADO_OPTS = [
  { value: 'al_dia',    label: 'Al día' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'atrasado',  label: 'Atrasado' },
] as const;

export function ListaClientesContables({ store, onSeleccionar }: { store: Store; onSeleccionar: (id: string) => void }) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [form, setForm] = useState({
    nombre: '', cedula: '', telefono: '', email: '',
    honorariosMensuales: '', estado: 'al_dia' as const, notas: '',
  });

  const lbl = { fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', display: 'block', marginBottom: 5 };

  function guardar() {
    if (!form.nombre) return;
    store.agregarCliente({
      nombre: form.nombre,
      cedula: form.cedula,
      telefono: form.telefono,
      email: form.email,
      honorariosMensuales: Math.round(Number(form.honorariosMensuales) || 0),
      estado: form.estado,
      notas: form.notas,
    });
    setForm({ nombre: '', cedula: '', telefono: '', email: '', honorariosMensuales: '', estado: 'al_dia', notas: '' });
    setMostrarForm(false);
  }

  const filtrados = store.clientes
    .filter(c => busqueda === '' || c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.cedula.includes(busqueda))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', alignItems: 'center' }}>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o cédula..." style={{ flex: 1 }} />
        <button className="btn-ghost" style={{ fontSize: 12, whiteSpace: 'nowrap' }}
          onClick={() => setMostrarForm(v => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Nuevo cliente'}
        </button>
      </div>

      {mostrarForm && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem' }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: 'var(--purple)', marginBottom: '1rem' }}>Nuevo cliente contable</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            {[
              { campo: 'nombre',    label: 'Nombre / razón social', placeholder: 'Empresa o persona' },
              { campo: 'cedula',    label: 'Cédula / RUC',          placeholder: '3-xxx-xxxxxx' },
              { campo: 'telefono',  label: 'Teléfono',              placeholder: '8888-8888' },
              { campo: 'email',     label: 'Correo',                placeholder: 'correo@email.com' },
              { campo: 'honorariosMensuales', label: 'Honorarios mensuales (₡)', placeholder: '50000' },
            ].map(f => (
              <div key={f.campo} style={{ marginBottom: 12 }}>
                <label style={lbl}>{f.label}</label>
                <input
                  value={(form as any)[f.campo]}
                  onChange={e => setForm(p => ({...p, [f.campo]: e.target.value}))}
                  placeholder={f.placeholder}
                  type={f.campo === 'honorariosMensuales' ? 'number' : 'text'}
                />
              </div>
            ))}
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Estado</label>
              <select value={form.estado} onChange={e => setForm(p => ({...p, estado: e.target.value as any}))}>
                {ESTADO_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>Notas</label>
            <textarea value={form.notas} onChange={e => setForm(p => ({...p, notas: e.target.value}))}
              placeholder="Información adicional..." style={{ minHeight: 60, resize: 'vertical' }} />
          </div>
          <button className="btn-primary" onClick={guardar} disabled={!form.nombre}>Guardar cliente</button>
        </div>
      )}

      {filtrados.length === 0 ? (
        <p className="font-serif" style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2.5rem 0', fontStyle: 'italic', fontSize: 16 }}>
          {busqueda ? 'Sin resultados.' : 'Aún no hay clientes registrados.'}
        </p>
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 10, padding: '4px 16px' }}>
          {filtrados.map((c, i) => (
            <div key={c.id}
              onClick={() => onSeleccionar(c.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', cursor: 'pointer',
                borderBottom: i < filtrados.length - 1 ? '1px solid var(--border-dim)' : 'none',
              }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: ESTADO_CONFIG[c.estado].bg,
                border: `1px solid ${ESTADO_CONFIG[c.estado].color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Cinzel, serif', fontSize: 12, color: ESTADO_CONFIG[c.estado].color,
                flexShrink: 0,
              }}>
                {c.nombre.slice(0,2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{c.nombre}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.cedula || 'Sin cédula'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: 'var(--gold)', marginBottom: 3 }}>
                  {formatColones(c.honorariosMensuales)}/mes
                </p>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: ESTADO_CONFIG[c.estado].bg, color: ESTADO_CONFIG[c.estado].color }}>
                  {ESTADO_CONFIG[c.estado].label}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
