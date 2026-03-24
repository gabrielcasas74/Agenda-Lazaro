import { useState } from 'react';
import type { Cliente, Cita, NotaSesion } from '../../types';
import { SERVICIOS } from '../../types';
import {
  formatColones,
  formatFechaCorta,
  formatHora,
  getSigno,
  getEdad,
  getIniciales,
} from '../../utils';

interface Props {
  cliente: Cliente;
  citas: Cita[];
  notas: NotaSesion[];
  onAgregarNota: (citaId: string, texto: string) => void;
  onActualizarTags: (
    campo: 'intereses' | 'nombresImportantes' | 'productosTrabajos',
    tags: string[]
  ) => void;
  onVolver: () => void;
}

type TagCampo = 'intereses' | 'nombresImportantes' | 'productosTrabajos';

export function FichaCliente({
  cliente,
  citas,
  notas,
  onAgregarNota,
  onActualizarTags,
  onVolver,
}: Props) {
  const [nuevaNota, setNuevaNota] = useState('');
  const [citaSeleccionada, setCitaSeleccionada] = useState<string>(
    citas[0]?.id ?? ''
  );
  const [nuevoTag, setNuevoTag] = useState<Record<TagCampo, string>>({
    intereses: '',
    nombresImportantes: '',
    productosTrabajos: '',
  });
  const [editandoTag, setEditandoTag] = useState<TagCampo | null>(null);

  function agregarTag(campo: TagCampo) {
    const valor = nuevoTag[campo].trim();
    if (!valor) return;
    const actuales = cliente[campo] ?? [];
    if (!actuales.includes(valor)) {
      onActualizarTags(campo, [...actuales, valor]);
    }
    setNuevoTag(prev => ({ ...prev, [campo]: '' }));
    setEditandoTag(null);
  }

  function eliminarTag(campo: TagCampo, tag: string) {
    const actuales = cliente[campo] ?? [];
    onActualizarTags(campo, actuales.filter(t => t !== tag));
  }

  function guardarNota() {
    if (!nuevaNota.trim() || !citaSeleccionada) return;
    onAgregarNota(citaSeleccionada, nuevaNota);
    setNuevaNota('');
  }

  const signo = getSigno(cliente.fechaNacimiento);
  const edad = getEdad(cliente.fechaNacimiento);
  const iniciales = getIniciales(cliente.nombre);

  const tagConfig: { campo: TagCampo; label: string; color: string }[] = [
    { campo: 'intereses', label: 'Intereses y temas frecuentes', color: 'coral' },
    { campo: 'nombresImportantes', label: 'Nombres importantes que mencionó', color: 'purple' },
    { campo: 'productosTrabajos', label: 'Productos · velas · trabajos encargados', color: 'amber' },
  ];

  return (
    <div>
      {/* Header */}
      <button
        onClick={onVolver}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text-secondary)',
          fontSize: '13px',
          cursor: 'pointer',
          padding: '0 0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        ← Volver a clientes
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.5rem' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: '#FAECE7', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '15px', fontWeight: 500,
          color: '#712B13', flexShrink: 0,
        }}>
          {iniciales}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>
            {cliente.nombre}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
            Cliente desde {formatFechaCorta(cliente.creadoEn)} · {cliente.totalCitas} consulta{cliente.totalCitas !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>
            {formatColones(cliente.totalIngresos)}
          </p>
          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>acumulado</p>
        </div>
      </div>

      {/* Datos básicos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>
        {[
          { label: 'Teléfono', value: cliente.telefono },
          { label: 'Nacimiento', value: formatFechaCorta(cliente.fechaNacimiento), sub: `${signo} · ${edad} años` },
          { label: 'Modalidad usual', value: cliente.modalidadUsual === 'presencial' ? 'Presencial' : 'Virtual' },
        ].map(item => (
          <div key={item.label}>
            <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 4px' }}>
              {item.label}
            </p>
            <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', margin: 0 }}>{item.value}</p>
            {item.sub && <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>{item.sub}</p>}
          </div>
        ))}
      </div>

      <hr style={{ border: 'none', borderTop: '0.5px solid var(--color-border-tertiary)', margin: '1.25rem 0' }} />

      {/* Tags editables */}
      {tagConfig.map(({ campo, label, color }) => (
        <div key={campo} style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 8px' }}>
            {label}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            {(cliente[campo] ?? []).map(tag => (
              <span
                key={tag}
                style={{
                  fontSize: '12px', padding: '3px 10px', borderRadius: '12px',
                  background: color === 'coral' ? '#FAECE7' : color === 'purple' ? '#EEEDFE' : '#FAEEDA',
                  color: color === 'coral' ? '#712B13' : color === 'purple' ? '#3C3489' : '#633806',
                  border: `0.5px solid ${color === 'coral' ? '#F0997B' : color === 'purple' ? '#AFA9EC' : '#EF9F27'}`,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
                onClick={() => eliminarTag(campo, tag)}
                title="Click para eliminar"
              >
                {tag} <span style={{ opacity: 0.6, fontSize: '10px' }}>×</span>
              </span>
            ))}

            {editandoTag === campo ? (
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  autoFocus
                  value={nuevoTag[campo]}
                  onChange={e => setNuevoTag(prev => ({ ...prev, [campo]: e.target.value }))}
                  onKeyDown={e => {
                    if (e.key === 'Enter') agregarTag(campo);
                    if (e.key === 'Escape') setEditandoTag(null);
                  }}
                  placeholder="Escribí y Enter"
                  style={{ fontSize: '12px', padding: '3px 8px', width: '140px', borderRadius: '6px' }}
                />
                <button onClick={() => agregarTag(campo)} style={{ fontSize: '12px', padding: '3px 10px' }}>+</button>
              </div>
            ) : (
              <span
                onClick={() => setEditandoTag(campo)}
                style={{
                  fontSize: '12px', padding: '3px 10px', borderRadius: '12px',
                  border: '0.5px dashed var(--color-border-secondary)',
                  color: 'var(--color-text-secondary)', cursor: 'pointer',
                }}
              >
                + agregar
              </span>
            )}
          </div>
        </div>
      ))}

      <hr style={{ border: 'none', borderTop: '0.5px solid var(--color-border-tertiary)', margin: '1.25rem 0' }} />

      {/* Notas por sesión */}
      <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 12px' }}>
        Notas por sesión
      </p>

      {notas.length === 0 && (
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Aún no hay notas para este cliente.
        </p>
      )}

      {notas.map(nota => {
        const citaDeNota = citas.find(c => c.id === nota.citaId);
        return (
          <div
            key={nota.id}
            style={{
              borderLeft: '2px solid #F0997B',
              background: 'var(--color-background-secondary)',
              borderRadius: '0 8px 8px 0',
              padding: '10px 12px',
              marginBottom: '8px',
            }}
          >
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>
              {formatFechaCorta(nota.fecha)}
              {citaDeNota && ` · ${SERVICIOS[citaDeNota.tipo].nombre} · ${citaDeNota.modalidad === 'presencial' ? 'Presencial' : 'Virtual'}`}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.6 }}>
              {nota.texto}
            </p>
          </div>
        );
      })}

      {/* Nueva nota */}
      <div style={{ marginTop: '1rem' }}>
        <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 6px' }}>
          Nueva nota
        </p>
        {citas.length > 0 && (
          <select
            value={citaSeleccionada}
            onChange={e => setCitaSeleccionada(e.target.value)}
            style={{ width: '100%', marginBottom: '8px', fontSize: '13px' }}
          >
            {citas.map(c => (
              <option key={c.id} value={c.id}>
                {formatFechaCorta(c.fecha)} · {SERVICIOS[c.tipo].nombre} · {c.modalidad}
              </option>
            ))}
          </select>
        )}
        <textarea
          value={nuevaNota}
          onChange={e => setNuevaNota(e.target.value)}
          placeholder="Anotá aquí lo que querés recordar: lo que preguntó, nombres, lo que sentiste en las cartas, productos sugeridos..."
          style={{
            width: '100%', boxSizing: 'border-box',
            fontSize: '13px', padding: '10px 12px',
            borderRadius: '8px', border: '0.5px solid var(--color-border-secondary)',
            background: 'var(--color-background-primary)',
            color: 'var(--color-text-primary)',
            resize: 'vertical', minHeight: '80px',
            fontFamily: 'var(--font-sans)',
          }}
        />
        <button
          onClick={guardarNota}
          disabled={!nuevaNota.trim()}
          style={{
            marginTop: '8px', padding: '8px 20px',
            borderRadius: '8px', border: '0.5px solid #993C1D',
            background: '#FAECE7', color: '#712B13',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            opacity: !nuevaNota.trim() ? 0.5 : 1,
          }}
        >
          Guardar nota
        </button>
      </div>

      <hr style={{ border: 'none', borderTop: '0.5px solid var(--color-border-tertiary)', margin: '1.5rem 0' }} />

      {/* Historial */}
      <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 10px' }}>
        Historial de citas
      </p>
      <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '12px', padding: '4px 16px' }}>
        {citas.length === 0 && (
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', padding: '12px 0' }}>Sin citas registradas aún.</p>
        )}
        {citas.map((cita, i) => (
          <div
            key={cita.id}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0',
              borderBottom: i < citas.length - 1 ? '0.5px solid var(--color-border-tertiary)' : 'none',
              fontSize: '13px',
            }}
          >
            <span style={{ color: 'var(--color-text-secondary)' }}>{formatFechaCorta(cita.fecha)}</span>
            <span>{SERVICIOS[cita.tipo].nombre}</span>
            <span style={{
              fontSize: '11px', padding: '3px 10px', borderRadius: '12px', fontWeight: 500,
              background: cita.modalidad === 'presencial' ? '#FAECE7' : '#E1F5EE',
              color: cita.modalidad === 'presencial' ? '#712B13' : '#085041',
            }}>
              {cita.modalidad === 'presencial' ? 'Presencial' : 'Virtual'}
            </span>
            <span style={{ fontWeight: 500 }}>{formatColones(cita.precio)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
