import { useState } from 'react';
import type { useLazaroStore } from '../../hooks/useLazaroStore';
import { FichaCliente } from './FichaCliente';
import { formatFechaCorta, getIniciales } from '../../utils';

type Store = ReturnType<typeof useLazaroStore>;

export function PantallaClientes({ store, onVerCita }: { store: Store; onVerCita: () => void }) {
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const cliente = seleccionado ? store.getCliente(seleccionado) : null;

  if (cliente) {
    return (
      <FichaCliente
        cliente={cliente}
        citas={store.getCitasDeCliente(cliente.id)}
        notas={store.getNotasDeCliente(cliente.id)}
        onAgregarNota={(citaId, texto) => store.agregarNota(citaId, cliente.id, texto)}
        onActualizarTags={(campo, tags) => store.actualizarTagsCliente(cliente.id, campo, tags)}
        onVolver={() => setSeleccionado(null)}
      />
    );
  }

  const stats = store.getStats();
  const filtrados = store.clientes
    .filter(c => busqueda === '' || c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.telefono.includes(busqueda))
    .sort((a, b) => b.totalCitas - a.totalCitas);

  const inicioMes = new Date(); inicioMes.setDate(1);
  const nuevosEsteMes = store.clientes.filter(c => new Date(c.creadoEn) >= inicioMes).length;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10, marginBottom: '1.75rem' }}>
        {[
          { label: 'Total clientes',    value: stats.totalClientes },
          { label: 'Repiten',           value: stats.clientesRepiten },
          { label: 'Nuevos este mes',   value: nuevosEsteMes },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value">{s.value}</p>
          </div>
        ))}
      </div>

      <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre o teléfono..." style={{ marginBottom: '1rem' }} />

      {filtrados.length === 0 && (
        <p className="font-serif" style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2.5rem 0', fontStyle: 'italic', fontSize: 16 }}>
          {busqueda ? 'Sin resultados.' : 'Aún no hay clientes registrados.'}
        </p>
      )}

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 10, padding: '4px 16px' }}>
        {filtrados.map((c, i) => (
          <div key={c.id} className="cliente-row" onClick={() => setSeleccionado(c.id)}
            style={{ borderBottom: i < filtrados.length - 1 ? '1px solid var(--border-dim)' : 'none' }}>
            <div className="avatar" style={{ width: 38, height: 38, fontSize: 12 }}>
              {getIniciales(c.nombre)}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>
                {c.nombre}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {c.telefono}{c.fechaNacimiento ? ` · ${formatFechaCorta(c.fechaNacimiento)}` : ''}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>
                {c.totalCitas} cita{c.totalCitas !== 1 ? 's' : ''}
              </p>
              {c.totalCitas > 1
                ? <span className="badge badge-fiel">cliente fiel</span>
                : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>nuevo</span>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
