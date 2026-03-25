import { useState } from 'react';
import { useContabilidadStore } from '../../hooks/useContabilidadStore';
import { ListaClientesContables } from './ListaClientesContables';
import { FichaClienteContable } from './FichaClienteContable';
import { ResumenContable } from './ResumenContable';

type Vista = 'resumen' | 'clientes';

export function PantallaContabilidad() {
  const store = useContabilidadStore();
  const [vista, setVista] = useState<Vista>('resumen');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);

  const cliente = clienteSeleccionado ? store.getCliente(clienteSeleccionado) : null;

  if (cliente) {
    return (
      <FichaClienteContable
        cliente={cliente}
        declaraciones={store.getDeclaracionesCliente(cliente.id)}
        pagos={store.getPagosCliente(cliente.id)}
        store={store}
        onVolver={() => setClienteSeleccionado(null)}
      />
    );
  }

  return (
    <div>
      {/* Sub-nav */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        {([
          { id: 'resumen',  label: 'Resumen' },
          { id: 'clientes', label: `Clientes (${store.clientes.length})` },
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
      </div>

      {vista === 'resumen'  && <ResumenContable store={store} onVerClientes={() => setVista('clientes')} />}
      {vista === 'clientes' && <ListaClientesContables store={store} onSeleccionar={setClienteSeleccionado} />}
    </div>
  );
}
