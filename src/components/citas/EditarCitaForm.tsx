import { useState } from 'react';
import type { Cita, TipoLectura, Modalidad } from '../../types';
import { SERVICIOS } from '../../types';

interface Props {
  cita: Cita;
  onGuardar: (datos: Partial<Cita>) => void;
  onCancelar: () => void;
}

export function EditarCitaForm({ cita, onGuardar, onCancelar }: Props) {
  const [form, setForm] = useState({
    clienteNombre:          cita.clienteNombre,
    clienteTelefono:        cita.clienteTelefono,
    clienteFechaNacimiento: cita.clienteFechaNacimiento,
    tipo:                   cita.tipo as TipoLectura,
    modalidad:              cita.modalidad as Modalidad,
    fecha:                  cita.fecha,
    hora:                   cita.hora,
    intencion:              cita.intencion,
  });

  const set = (campo: string, valor: string) =>
    setForm(prev => ({ ...prev, [campo]: valor }));

  const lbl = {
    fontSize: 11, letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'var(--text-muted)', display: 'block', marginBottom: 5,
  };

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 10, padding: '1.25rem',
      marginBottom: 10,
    }}>
      <p style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: 'var(--purple)', marginBottom: '1rem', letterSpacing: '0.05em' }}>
        Editar cita
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        {[
          { campo: 'clienteNombre',          label: 'Nombre',              type: 'text' },
          { campo: 'clienteTelefono',        label: 'Teléfono',            type: 'text' },
          { campo: 'clienteFechaNacimiento', label: 'Fecha de nacimiento', type: 'date' },
          { campo: 'fecha',                  label: 'Fecha de la cita',    type: 'date' },
          { campo: 'hora',                   label: 'Hora',                type: 'time' },
        ].map(f => (
          <div key={f.campo} style={{ marginBottom: 12 }}>
            <label style={lbl}>{f.label}</label>
            <input
              type={f.type}
              value={(form as any)[f.campo]}
              onChange={e => set(f.campo, e.target.value)}
            />
          </div>
        ))}

        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Tipo</label>
          <select value={form.tipo} onChange={e => set('tipo', e.target.value)}>
            <option value="breve">Lectura breve · 15 min · ₡8.000</option>
            <option value="completa">Lectura completa · 40 min · ₡15.000</option>
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Modalidad</label>
          <select value={form.modalidad} onChange={e => set('modalidad', e.target.value)}>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Intención / consulta</label>
        <textarea
          value={form.intencion}
          onChange={e => set('intencion', e.target.value)}
          style={{ minHeight: 60, resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn-primary"
          style={{ flex: 1 }}
          onClick={() => onGuardar({ ...form, precio: SERVICIOS[form.tipo].precio })}
        >
          Guardar cambios
        </button>
        <button className="btn-ghost" onClick={onCancelar} style={{ flex: 1 }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
