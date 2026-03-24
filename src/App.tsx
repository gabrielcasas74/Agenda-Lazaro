import { useState } from 'react';
import { useLazaroStore } from './hooks/useLazaroStore';
import { PantallaCitas } from './components/citas/PantallaCitas';
import { PantallaClientes } from './components/clientes/PantallaClientes';
import { PantallaConfig } from './components/config/PantallaConfig';

type Pantalla = 'citas' | 'clientes' | 'config';

export default function App() {
  const [pantalla, setPantalla] = useState<Pantalla>('citas');
  const store = useLazaroStore();

  return (
    <div style={{
      maxWidth: '680px',
      margin: '0 auto',
      padding: '1.5rem 1rem',
      minHeight: '100vh',
      background: 'var(--color-background-tertiary)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 500, margin: 0, color: 'var(--color-text-primary)' }}>
            Lázaro — Lecturas de Tarot
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
            Panel de administración
          </p>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: '#FAECE7', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: 500, color: '#712B13',
        }}>
          GL
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
        {([
          { id: 'citas', label: 'Próximas citas' },
          { id: 'clientes', label: 'Clientes' },
          { id: 'config', label: 'Mi link' },
        ] as { id: Pantalla; label: string }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setPantalla(tab.id)}
            style={{
              fontSize: '13px', padding: '6px 16px', borderRadius: '20px',
              border: '0.5px solid',
              borderColor: pantalla === tab.id ? '#993C1D' : 'var(--color-border-secondary)',
              background: pantalla === tab.id ? '#FAECE7' : 'transparent',
              color: pantalla === tab.id ? '#712B13' : 'var(--color-text-secondary)',
              fontWeight: pantalla === tab.id ? 500 : 400,
              cursor: 'pointer',
              transition: 'all .15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: '12px',
        padding: '1.25rem',
      }}>
        {pantalla === 'citas' && <PantallaCitas store={store} />}
        {pantalla === 'clientes' && (
          <PantallaClientes
            store={store}
            onVerCita={() => setPantalla('citas')}
          />
        )}
        {pantalla === 'config' && <PantallaConfig />}
      </div>
    </div>
  );
}
