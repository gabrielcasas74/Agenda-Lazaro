import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useLazaroStore } from './hooks/useLazaroStore';
import { PantallaLogin } from './components/auth/PantallaLogin';
import { PantallaCitas } from './components/citas/PantallaCitas';
import { PantallaClientes } from './components/clientes/PantallaClientes';
import { PantallaConfig } from './components/config/PantallaConfig';
import { PantallaFinanzas } from './components/finanzas/PantallaFinanzas';
import { PantallaMEP } from './components/mep/PantallaMEP';
import { PantallaContabilidad } from './components/contabilidad/PantallaContabilidad';

type Pantalla = 'citas' | 'clientes' | 'finanzas' | 'contabilidad' | 'mep' | 'config';

export default function App() {
  const { user, cargando: authCargando, signIn, signOut } = useAuth();
  const [pantalla, setPantalla] = useState<Pantalla>('citas');
  const store = useLazaroStore();

  // Pantalla de carga inicial
  if (authCargando) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)' }}>
        <p className="font-display" style={{ fontSize: 14, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          Cargando...
        </p>
      </div>
    );
  }

  // Login si no hay sesión
  if (!user) {
    return <PantallaLogin onLogin={signIn} />;
  }

  const tabs: { id: Pantalla; label: string }[] = [
    { id: 'citas',        label: 'Citas' },
    { id: 'clientes',     label: 'Clientes' },
    { id: 'finanzas',     label: 'Finanzas' },
    { id: 'contabilidad', label: 'Contabilidad' },
    { id: 'mep',          label: 'MEP' },
    { id: 'config',       label: 'Mi link' },
  ];

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem 1.25rem', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }} className="fade-up">
        <div>
          <h1 className="font-display" style={{ fontSize: 22, color: 'var(--purple)', fontWeight: 500, letterSpacing: '0.08em', marginBottom: 4 }}>
            Lázaro
          </h1>
          <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Lecturas de Tarot — Panel de administración
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="avatar" style={{ width: 38, height: 38, fontSize: 13, cursor: 'default' }} title={user.email ?? ''}>
            {(user.email ?? 'U')[0].toUpperCase()}
          </div>
          <button className="btn-ghost" style={{ fontSize: 11 }} onClick={signOut}>
            Salir
          </button>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1.75rem', flexWrap: 'wrap' }} className="fade-up">
        {tabs.map(tab => (
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
        {store.cargando ? (
          <p style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontFamily: 'EB Garamond, serif', fontStyle: 'italic', fontSize: 16 }}>
            Cargando datos...
          </p>
        ) : (
          <>
            {pantalla === 'citas'        && <PantallaCitas store={store} />}
            {pantalla === 'clientes'     && <PantallaClientes store={store} onVerCita={() => setPantalla('citas')} />}
            {pantalla === 'finanzas'     && <PantallaFinanzas store={store} />}
            {pantalla === 'contabilidad' && <PantallaContabilidad />}
            {pantalla === 'mep'          && <PantallaMEP />}
            {pantalla === 'config'       && <PantallaConfig />}
          </>
        )}
      </div>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
        LÁZARO · LECTURAS DE TAROT
      </p>
    </div>
  );
}
