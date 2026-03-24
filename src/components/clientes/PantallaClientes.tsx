import { useState } from 'react';
import type { useLazaroStore } from '../../hooks/useLazaroStore';
import { FichaCliente } from './FichaCliente';
import { formatColones, formatFechaCorta, getIniciales } from '../../utils';

type Store = ReturnType<typeof useLazaroStore>;

export function PantallaClientes({ store, onVerCita }: { store: Store; onVerCita: () => void }) {
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const cliente = clienteSeleccionado ? store.getCliente(clienteSeleccionado) : null;

  if (cliente) {
    const citasCliente = store.getCitasDeCliente(cliente.id);
    const notasCliente = store.getNotasDeCliente(cliente.id);
    return (
      <FichaCliente
        cliente={cliente}
        citas={citasCliente}
        notas={notasCliente}
        onAgregarNota={(citaId, texto) => store.agregarNota(citaId, cliente.id, texto)}
        onActualizarTags={(campo, tags) => store.actualizarTagsCliente(cliente.id, campo, tags)}
        onVolver={() => setClienteSeleccionado(null)}
      />
    );
  }

  const clientesFiltrados = store.clientes
    .filter(c =>
      busqueda === '' ||
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.telefono.includes(busqueda)
    )
    .sort((a, b) => b.totalCitas - a.totalCitas);

  const stats = store.getStats();

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '10px', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total clientes', value: stats.totalClientes },
          { label: 'Repiten', value: stats.clientesRepiten },
          { label: 'Nuevos este mes', value: store.clientes.filter(c => {
            const inicio = new Date(); inicio.setDate(1);
            return new Date(c.creadoEn) >= inicio;
          }).length },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--color-background-secondary)', borderRadius: '8px', padding: '12px 14px' }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>{s.label}</p>
            <p style={{ fontSize: '22px', fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Búsqueda */}
      <input
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre o teléfono..."
        style={{ width: '100%', boxSizing: 'border-box', marginBottom: '1rem', fontSize: '13px' }}
      />

      {/* Lista */}
      {clientesFiltrados.length === 0 && (
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
          {busqueda ? 'Sin resultados.' : 'Aún no hay clientes registrados.'}
        </p>
      )}

      <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '12px', padding: '4px 16px' }}>
        {clientesFiltrados.map((c, i) => (
          <div
            key={c.id}
            onClick={() => setClienteSeleccionado(c.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 0', cursor: 'pointer',
              borderBottom: i < clientesFiltrados.length - 1 ? '0.5px solid var(--color-border-tertiary)' : 'none',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#FAECE7', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '13px', fontWeight: 500,
              color: '#712B13', flexShrink: 0,
            }}>
              {getIniciales(c.nombre)}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 2px' }}>
                {c.nombre}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                {c.telefono}
                {c.fechaNacimiento && ` · ${formatFechaCorta(c.fechaNacimiento)}`}
              </p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 2px' }}>
                {c.totalCitas} cita{c.totalCitas !== 1 ? 's' : ''}
              </p>
              <span style={{
                fontSize: '11px',
                color: c.totalCitas > 1 ? '#085041' : 'var(--color-text-secondary)',
              }}>
                {c.totalCitas > 1 ? 'cliente fiel' : 'nuevo'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {store.clientes.length > 0 && (
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '12px', textAlign: 'center' }}>
          Los datos se guardan automáticamente desde el formulario de agendamiento
        </p>
      )}
    </div>
  );
}
