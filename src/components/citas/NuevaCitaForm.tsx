import { useState } from 'react';
import type { TipoLectura, Modalidad } from '../../types';

interface Props {
  onGuardar: (datos: {
    clienteNombre: string; clienteTelefono: string; clienteFechaNacimiento: string;
    tipo: TipoLectura; modalidad: Modalidad; fecha: string; hora: string; intencion: string;
  }) => void;
}

export function NuevaCitaForm({ onGuardar }: Props) {
  const [form, setForm] = useState({
    clienteNombre: '', clienteTelefono: '', clienteFechaNacimiento: '',
    tipo: 'completa' as TipoLectura, modalidad: 'presencial' as Modalidad,
    fecha: '', hora: '', intencion: '',
  });
  const set = (campo: string, valor: string) => setForm(prev => ({ ...prev, [campo]: valor }));
  const valido = () => !!(form.clienteNombre && form.clienteTelefono && form.fecha && form.hora);

  const lbl = { fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', display: 'block', marginBottom: 5 };

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 10, padding: '1.25rem' }}>
      <p className="font-display" style={{ fontSize: 13, color: 'var(--gold)', letterSpacing: '0.06em', marginBottom: '1rem' }}>
        Nueva cita
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        {[
          { campo: 'clienteNombre', label: 'Nombre', placeholder: 'Nombre completo', type: 'text' },
          { campo: 'clienteTelefono', label: 'Teléfono', placeholder: '8888-8888', type: 'text' },
          { campo: 'clienteFechaNacimiento', label: 'Fecha de nacimiento', placeholder: '', type: 'date' },
          { campo: 'fecha', label: 'Fecha de la cita', placeholder: '', type: 'date' },
          { campo: 'hora', label: 'Hora', placeholder: '', type: 'time' },
        ].map(f => (
          <div key={f.campo} style={{ marginBottom: 12 }}>
            <label style={lbl}>{f.label}</label>
            <input type={f.type} value={(form as any)[f.campo]} placeholder={f.placeholder}
              onChange={e => set(f.campo, e.target.value)} />
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
            <option value="presencial">Presencial (sábado)</option>
            <option value="virtual">Virtual (llamada / video)</option>
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Intención / consulta (opcional)</label>
        <textarea value={form.intencion} onChange={e => set('intencion', e.target.value)}
          placeholder="¿Sobre qué quiere consultar?" style={{ minHeight: 64, resize: 'vertical' }} />
      </div>
      <button className="btn-primary" onClick={() => onGuardar(form)} disabled={!valido()}>
        Guardar cita
      </button>
    </div>
  );
}
