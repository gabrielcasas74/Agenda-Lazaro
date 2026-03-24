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
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.25rem', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }} className="fade-up">
        <div>
          <h1 className="font-display" style={{ fontSize: 22, color: 'var(--purple)', fontWeight: 500, letterSpacing: '0.08em', marginBottom: 4 }}>
            Lázaro
          </h1>
          <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Lecturas de Tarot — Panel de administración
          </p>
        </div>
        <div className="avatar" style={{ width: 42, height: 42, fontSize: 13 }}>GL</div>
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.75rem' }} className="fade-up">
        {([
          { id: 'citas',    label: 'Próximas citas' },
          { id: 'clientes', label: 'Clientes' },
          { id: 'config',   label: 'Mi link' },
        ] as { id: Pantalla; label: string }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setPantalla(tab.id)}
            className={`nav-tab${pantalla === tab.id ? ' active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="card fade-up">
        {pantalla === 'citas'    && <PantallaCitas store={store} />}
        {pantalla === 'clientes' && <PantallaClientes store={store} onVerCita={() => setPantalla('citas')} />}
        {pantalla === 'config'   && <PantallaConfig />}
      </div>

      {/* Footer */}
      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em', fontFamily: 'Lato, sans-serif' }}>
        LÁZARO · LECTURAS DE TAROT
      </p>
    </div>
  );
}
