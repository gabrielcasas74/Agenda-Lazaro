import { useState } from 'react';
import type { TipoLectura, Modalidad } from '../../types';

interface Props {
  onGuardar: (datos: {
    clienteNombre: string;
    clienteTelefono: string;
    clienteFechaNacimiento: string;
    tipo: TipoLectura;
    modalidad: Modalidad;
    fecha: string;
    hora: string;
    intencion: string;
  }) => void;
}

export function NuevaCitaForm({ onGuardar }: Props) {
  const [form, setForm] = useState({
    clienteNombre: '',
    clienteTelefono: '',
    clienteFechaNacimiento: '',
    tipo: 'completa' as TipoLectura,
    modalidad: 'presencial' as Modalidad,
    fecha: '',
    hora: '',
    intencion: '',
  });

  function set(campo: string, valor: string) {
    setForm(prev => ({ ...prev, [campo]: valor }));
  }

  function valido() {
    return form.clienteNombre && form.clienteTelefono && form.fecha && form.hora;
  }

  const labelStyle = { fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', display: 'block' };
  const rowStyle = { marginBottom: '12px' };

  return (
    <div style={{
      background: 'var(--color-background-secondary)',
      borderRadius: '10px', padding: '16px',
    }}>
      <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 14px' }}>
        Nueva cita
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <div style={rowStyle}>
          <label style={labelStyle}>Nombre</label>
          <input value={form.clienteNombre} onChange={e => set('clienteNombre', e.target.value)} placeholder="Nombre completo" style={{ width: '100%', boxSizing: 'border-box' }} />
        </div>
        <div style={rowStyle}>
          <label style={labelStyle}>Teléfono</label>
          <input value={form.clienteTelefono} onChange={e => set('clienteTelefono', e.target.value)} placeholder="8888-8888" style={{ width: '100%', boxSizing: 'border-box' }} />
        </div>
        <div style={rowStyle}>
          <label style={labelStyle}>Fecha de nacimiento</label>
          <input type="date" value={form.clienteFechaNacimiento} onChange={e => set('clienteFechaNacimiento', e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
        </div>
        <div style={rowStyle}>
          <label style={labelStyle}>Tipo de lectura</label>
          <select value={form.tipo} onChange={e => set('tipo', e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }}>
            <option value="breve">Lectura breve · 15 min · ₡6.000</option>
            <option value="completa">Lectura completa · 40 min · ₡12.000</option>
          </select>
        </div>
        <div style={rowStyle}>
          <label style={labelStyle}>Modalidad</label>
          <select value={form.modalidad} onChange={e => set('modalidad', e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }}>
            <option value="presencial">Presencial (sábado)</option>
            <option value="virtual">Virtual (llamada/videollamada)</option>
          </select>
        </div>
        <div style={rowStyle}>
          <label style={labelStyle}>Fecha</label>
          <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
        </div>
        <div style={rowStyle}>
          <label style={labelStyle}>Hora</label>
          <input type="time" value={form.hora} onChange={e => set('hora', e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={rowStyle}>
        <label style={labelStyle}>Intención / consulta (opcional)</label>
        <textarea
          value={form.intencion}
          onChange={e => set('intencion', e.target.value)}
          placeholder="¿Sobre qué quiere consultar?"
          style={{
            width: '100%', boxSizing: 'border-box', fontSize: '13px',
            padding: '8px 10px', borderRadius: '8px', border: '0.5px solid var(--color-border-secondary)',
            background: 'var(--color-background-primary)', color: 'var(--color-text-primary)',
            resize: 'vertical', minHeight: '60px', fontFamily: 'var(--font-sans)',
          }}
        />
      </div>

      <button
        onClick={() => onGuardar(form)}
        disabled={!valido()}
        style={{
          width: '100%', padding: '9px', borderRadius: '8px',
          border: '0.5px solid #993C1D', background: '#FAECE7',
          color: '#712B13', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          opacity: valido() ? 1 : 0.5,
        }}
      >
        Guardar cita
      </button>
    </div>
  );
}
