import { useState } from 'react';
import type { Cliente, Modalidad } from '../../types';

interface Props {
  cliente: Cliente;
  onGuardar: (datos: Partial<Cliente>) => void;
  onCancelar: () => void;
}

export function EditarClienteForm({ cliente, onGuardar, onCancelar }: Props) {
  const [form, setForm] = useState({
    nombre:          cliente.nombre,
    telefono:        cliente.telefono,
    fechaNacimiento: cliente.fechaNacimiento,
    modalidadUsual:  cliente.modalidadUsual as Modalidad,
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
      marginBottom: '1.25rem',
    }}>
      <p style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: 'var(--purple)', marginBottom: '1rem', letterSpacing: '0.05em' }}>
        Editar datos del cliente
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Nombre</label>
          <input value={form.nombre} onChange={e => set('nombre', e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Teléfono</label>
          <input value={form.telefono} onChange={e => set('telefono', e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Fecha de nacimiento</label>
          <input type="date" value={form.fechaNacimiento} onChange={e => set('fechaNacimiento', e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Modalidad usual</label>
          <select value={form.modalidadUsual} onChange={e => set('modalidadUsual', e.target.value)}>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-primary" style={{ flex: 1 }} onClick={() => onGuardar(form)}>
          Guardar cambios
        </button>
        <button className="btn-ghost" style={{ flex: 1 }} onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
