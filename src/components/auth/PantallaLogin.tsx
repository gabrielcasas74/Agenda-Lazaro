import { useState } from 'react';

interface Props {
  onLogin: (email: string, password: string) => Promise<string | null>;
}

export function PantallaLogin({ onLogin }: Props) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleSubmit() {
    if (!email || !password) return;
    setCargando(true);
    setError('');
    const err = await onLogin(email, password);
    if (err) setError('Correo o contraseña incorrectos.');
    setCargando(false);
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-page)', padding: '1rem',
    }}>
      <div style={{
        width: '100%', maxWidth: 380,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16, padding: '2.5rem 2rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="font-display" style={{ fontSize: 24, color: 'var(--purple)', letterSpacing: '0.1em', marginBottom: 6 }}>
            Lázaro
          </h1>
          <p className="font-serif" style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Panel de administración
          </p>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Correo
          </label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="tu@correo.com" autoComplete="email" />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Contraseña
          </label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="••••••••" autoComplete="current-password" />
        </div>

        {error && (
          <p style={{ fontSize: 13, color: 'var(--danger)', marginBottom: 14, textAlign: 'center' }}>
            {error}
          </p>
        )}

        <button className="btn-primary" onClick={handleSubmit} disabled={cargando || !email || !password}>
          {cargando ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
    </div>
  );
}
