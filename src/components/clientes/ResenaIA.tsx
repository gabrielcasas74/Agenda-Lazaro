import { useState } from 'react';
import type { Cliente } from '../../types';
import { getSigno, calcularArcano } from '../../utils';

interface Props {
  cliente: Cliente;
  onGuardar: (resena: string) => void;
}

export function ResenaIA({ cliente, onGuardar }: Props) {
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const [regenerando, setRegenerando] = useState(false);

  const signo   = getSigno(cliente.fechaNacimiento);
  const arcano  = calcularArcano(cliente.fechaNacimiento);
  const yatiene = !!cliente.resena;

  async function generar() {
    setGenerando(true);
    setError('');

    const intereses   = cliente.intereses.join(', ')           || 'no especificados';
    const nombres     = cliente.nombresImportantes.join(', ')  || 'ninguno registrado';
    const productos   = cliente.productosTrabajos.join(', ')   || 'ninguno aún';

    const prompt = `Eres Lázaro, un tarotista intuitivo y empático de Costa Rica. 
Generá una reseña esotérica breve (máximo 120 palabras) sobre este cliente para tu uso privado como lector.
La reseña debe combinar su signo zodiacal con su arcano personal y mencionar sus temas recurrentes.
Escribí en español, en tono cálido y espiritual, primera persona plural ("vemos", "se percibe").
No uses bullet points. Un solo párrafo fluido.

Cliente: ${cliente.nombre}
Signo zodiacal: ${signo}
Arcano personal: ${arcano.numero} — ${arcano.nombre}
Temas e intereses recurrentes: ${intereses}
Nombres importantes en su vida: ${nombres}
Productos/trabajos realizados: ${productos}

Reseña esotérica:`;

    try {
      const response = await fetch('/api/resena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      let data: any = {};
      try { data = await response.json(); } catch { data = {}; }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${data.error ?? response.statusText}`);
      }
      if (!data.texto) throw new Error('Respuesta vacía del servidor');
      onGuardar(data.texto.trim());
      setRegenerando(false);
    } catch (e: any) {
      setError(e.message ?? 'Error desconocido');
    } finally {
      setGenerando(false);
    }
  }

  const lbl = {
    fontSize: 10, letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: 'var(--text-muted)', marginBottom: 8, display: 'block',
  };

  return (
    <div>
      <span style={lbl}>Reseña esotérica</span>

      {/* Info: signo + arcano */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <span className="badge badge-breve">{signo}</span>
        {arcano.nombre && (
          <span className="badge badge-completa">
            {arcano.numero} · {arcano.nombre}
          </span>
        )}
      </div>

      {yatiene ? (
        <div>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderLeft: '3px solid var(--gold-dim)',
            borderRadius: '0 8px 8px 0',
            padding: '14px 16px',
            marginBottom: 12,
          }}>
            <p className="font-serif" style={{
              fontSize: 15, color: 'var(--text-primary)',
              lineHeight: 1.75, fontStyle: 'italic',
            }}>
              {cliente.resena}
            </p>
          </div>
          
          {/* 🔧 FIX: Botón para regenerar reseña con el nuevo arcano */}
          <button
            className="btn-ghost"
            onClick={() => {
              setRegenerando(true);
              generar();
            }}
            disabled={generando || !cliente.fechaNacimiento}
            style={{ 
              fontSize: 12, 
              opacity: generando ? 0.7 : 1,
              width: '100%',
            }}
          >
            {generando ? 'Regenerando reseña...' : '↻ Regenerar reseña con IA'}
          </button>
        </div>
      ) : (
        <div>
          {error && (
            <p style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 8 }}>{error}</p>
          )}
          <button
            className="btn-primary"
            onClick={generar}
            disabled={generando || !cliente.fechaNacimiento}
            style={{ opacity: generando ? 0.7 : 1 }}
          >
            {generando ? 'Generando reseña...' : '✦ Generar reseña con IA'}
          </button>
          {!cliente.fechaNacimiento && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              Necesitás la fecha de nacimiento para generar la reseña.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
