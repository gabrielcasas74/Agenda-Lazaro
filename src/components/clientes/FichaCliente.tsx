import { useState } from 'react';
import type { Cliente, Cita, NotaSesion } from '../../types';
import { SERVICIOS } from '../../types';
import {
  formatColones, formatFechaCorta, getSigno, getEdad,
  getIniciales, calcularArcano, descargarICS,
} from '../../utils';
import { ResenaIA } from './ResenaIA';

interface Props {
  cliente: Cliente; citas: Cita[]; notas: NotaSesion[];
  onAgregarNota: (citaId: string, texto: string) => void;
  onActualizarTags: (campo: 'intereses' | 'nombresImportantes' | 'productosTrabajos', tags: string[]) => void;
  onGuardarResena: (resena: string) => void;
  onVolver: () => void;
}

type TagCampo = 'intereses' | 'nombresImportantes' | 'productosTrabajos';

const TAG_CONFIG: { campo: TagCampo; label: string; cls: string }[] = [
  { campo: 'intereses',          label: 'Intereses y temas frecuentes',            cls: 'tag-coral'  },
  { campo: 'nombresImportantes', label: 'Nombres importantes que mencionó',        cls: 'tag-purple' },
  { campo: 'productosTrabajos',  label: 'Productos · velas · trabajos encargados', cls: 'tag-gold'   },
];

export function FichaCliente({ cliente, citas, notas, onAgregarNota, onActualizarTags, onGuardarResena, onVolver }: Props) {
  const [nuevaNota, setNuevaNota] = useState('');
  const [citaSeleccionada, setCitaSeleccionada] = useState(citas[0]?.id ?? '');
  const [nuevoTag, setNuevoTag] = useState<Record<TagCampo, string>>({ intereses: '', nombresImportantes: '', productosTrabajos: '' });
  const [editandoTag, setEditandoTag] = useState<TagCampo | null>(null);

  const signo  = getSigno(cliente.fechaNacimiento);
  const arcano = calcularArcano(cliente.fechaNacimiento);
  const lbl = { fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', marginBottom: 6, display: 'block' };

  function agregarTag(campo: TagCampo) {
    const v = nuevoTag[campo].trim();
    if (!v) return;
    const actual = cliente[campo] ?? [];
    if (!actual.includes(v)) onActualizarTags(campo, [...actual, v]);
    setNuevoTag(p => ({ ...p, [campo]: '' }));
    setEditandoTag(null);
  }

  return (
    <div>
      {/* Volver */}
      <button onClick={onVolver} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', letterSpacing: '0.05em', marginBottom: 20 }}>
        ← Volver
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.5rem' }}>
        <div className="avatar" style={{ width: 50, height: 50, fontSize: 15 }}>{getIniciales(cliente.nombre)}</div>
        <div style={{ flex: 1 }}>
          <h2 className="font-display" style={{ fontSize: 16, color: 'var(--text-primary)', letterSpacing: '0.05em', marginBottom: 3 }}>{cliente.nombre}</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Desde {formatFechaCorta(cliente.creadoEn)} · {cliente.totalCitas} consulta{cliente.totalCitas !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p className="font-display" style={{ fontSize: 15, color: 'var(--gold)' }}>{formatColones(cliente.totalIngresos)}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>acumulado</p>
        </div>
      </div>

      {/* Datos + perfil esotérico */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: '1rem' }}>
        <div>
          <span style={lbl}>Teléfono</span>
          <p style={{ fontSize: 14, color: 'var(--text-primary)' }}>{cliente.telefono}</p>
        </div>
        <div>
          <span style={lbl}>Nacimiento</span>
          <p style={{ fontSize: 14, color: 'var(--text-primary)' }}>{formatFechaCorta(cliente.fechaNacimiento)}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{signo} · {getEdad(cliente.fechaNacimiento)} años</p>
        </div>
        <div>
          <span style={lbl}>Arcano personal</span>
          <p style={{ fontSize: 14, color: 'var(--gold)', fontFamily: 'Cinzel, serif' }}>
            {arcano.numero} · {arcano.nombre}
          </p>
        </div>
      </div>

      {/* Botón .ics cumpleaños */}
      {cliente.fechaNacimiento && (
        <button
          className="btn-ghost"
          onClick={() => descargarICS(cliente.nombre, cliente.fechaNacimiento)}
          style={{ marginBottom: '1.25rem', fontSize: 12 }}
        >
          Descargar cumpleaños (.ics) →
        </button>
      )}

      <div className="divider" />

      {/* Reseña IA */}
      <div style={{ marginBottom: '1.5rem' }}>
        <ResenaIA cliente={cliente} onGuardar={onGuardarResena} />
      </div>

      <div className="divider" />

      {/* Tags */}
      {TAG_CONFIG.map(({ campo, label, cls }) => (
        <div key={campo} style={{ marginBottom: '1.25rem' }}>
          <span style={lbl}>{label}</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {(cliente[campo] ?? []).map(tag => (
              <span key={tag} className={`tag ${cls}`}
                onClick={() => onActualizarTags(campo, (cliente[campo] ?? []).filter(t => t !== tag))}
                title="Click para eliminar">
                {tag} <span style={{ opacity: 0.5, fontSize: 10 }}>×</span>
              </span>
            ))}
            {editandoTag === campo ? (
              <input autoFocus value={nuevoTag[campo]}
                onChange={e => setNuevoTag(p => ({ ...p, [campo]: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') agregarTag(campo); if (e.key === 'Escape') setEditandoTag(null); }}
                placeholder="Escribí y Enter"
                style={{ fontSize: 12, padding: '3px 8px', width: 150 }} />
            ) : (
              <span className="tag tag-add" onClick={() => setEditandoTag(campo)}>+ agregar</span>
            )}
          </div>
        </div>
      ))}

      <div className="divider" />

      {/* Notas */}
      <span style={lbl}>Notas por sesión</span>
      {notas.length === 0 && (
        <p className="font-serif" style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 15, marginBottom: '1rem' }}>Sin notas aún.</p>
      )}
      {notas.map(nota => {
        const cita = citas.find(c => c.id === nota.citaId);
        return (
          <div key={nota.id} className="nota-item" style={{ marginBottom: 8 }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>
              {formatFechaCorta(nota.fecha)}{cita ? ` · ${SERVICIOS[cita.tipo].nombre} · ${cita.modalidad}` : ''}
            </p>
            <p className="font-serif" style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.6 }}>{nota.texto}</p>
          </div>
        );
      })}

      {/* Nueva nota */}
      <div style={{ marginTop: '1rem' }}>
        <span style={lbl}>Nueva nota</span>
        {citas.length > 0 && (
          <select value={citaSeleccionada} onChange={e => setCitaSeleccionada(e.target.value)} style={{ marginBottom: 8 }}>
            {citas.map(c => (
              <option key={c.id} value={c.id}>{formatFechaCorta(c.fecha)} · {SERVICIOS[c.tipo].nombre} · {c.modalidad}</option>
            ))}
          </select>
        )}
        <textarea value={nuevaNota} onChange={e => setNuevaNota(e.target.value)}
          placeholder="Anotá lo que querés recordar: temas, nombres, cartas, productos sugeridos..."
          style={{ minHeight: 80, resize: 'vertical', marginBottom: 8 }} />
        <button className="btn-primary"
          onClick={() => { if (!nuevaNota.trim()) return; onAgregarNota(citaSeleccionada, nuevaNota); setNuevaNota(''); }}
          disabled={!nuevaNota.trim()}>
          Guardar nota
        </button>
      </div>

      <div className="divider" />

      {/* Historial */}
      <span style={lbl}>Historial de citas</span>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 10, padding: '4px 16px' }}>
        {citas.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '12px 0' }}>Sin citas registradas.</p>}
        {citas.map((c, i) => (
          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < citas.length - 1 ? '1px solid var(--border-dim)' : 'none' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatFechaCorta(c.fecha)}</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{SERVICIOS[c.tipo].nombre}</span>
            <span className={`badge badge-${c.modalidad}`}>{c.modalidad === 'presencial' ? 'Presencial' : 'Virtual'}</span>
            <span className="font-display" style={{ fontSize: 13, color: 'var(--gold)' }}>{formatColones(c.precio)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
