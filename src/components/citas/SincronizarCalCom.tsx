import { useState } from 'react';
import { useCalCom } from '../../hooks/useCalCom';
import type { useLazaroStore } from '../../hooks/useLazaroStore';

type Store = ReturnType<typeof useLazaroStore>;

export function SincronizarCalCom({ store }: { store: Store }) {
  const { cargando, error, sincronizar } = useCalCom();
  const [resultado, setResultado] = useState<{ nuevas: number; duplicadas: number } | null>(null);

  async function handleSincronizar() {
    setResultado(null);
    const citas = await sincronizar();
    if (!citas.length) return;

    const citasExistentes = store.citas.map(c => c.calEventId).filter(Boolean);
    let nuevas = 0;
    let duplicadas = 0;

    for (const cita of citas) {
      if (citasExistentes.includes(cita.calEventId)) {
        duplicadas++;
        continue;
      }
      store.agregarCita(cita);
      nuevas++;
    }

    setResultado({ nuevas, duplicadas });
  }

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-dim)',
      borderRadius: 10,
      padding: '14px 16px',
      marginBottom: '1.25rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
            Sincronizar con Cal.com
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Importa citas nuevas del link de agendamiento
          </p>
        </div>
        <button
          className="btn-ghost"
          onClick={handleSincronizar}
          disabled={cargando}
          style={{ whiteSpace: 'nowrap', opacity: cargando ? 0.6 : 1 }}
        >
          {cargando ? 'Sincronizando...' : '↻ Sincronizar'}
        </button>
      </div>

      {error && (
        <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 8 }}>{error}</p>
      )}

      {resultado && (
        <p style={{ fontSize: 12, color: 'var(--teal)', marginTop: 8 }}>
          {resultado.nuevas > 0
            ? `${resultado.nuevas} cita${resultado.nuevas > 1 ? 's' : ''} importada${resultado.nuevas > 1 ? 's' : ''} correctamente.`
            : 'Sin citas nuevas.'
          }
          {resultado.duplicadas > 0 && ` (${resultado.duplicadas} ya existían)`}
        </p>
      )}
    </div>
  );
}
