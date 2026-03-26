import { useState, useEffect } from 'react';
import type { useLazaroStore } from '../../hooks/useLazaroStore';
import { SERVICIOS } from '../../types';
import { formatColones } from '../../utils';
import { generarId } from '../../hooks/useLocalStorage';
import { supabase } from '../../lib/supabase';

type Store = ReturnType<typeof useLazaroStore>;

interface IngresoManual {
  id: string;
  descripcion: string;
  monto: number;
  fecha: string;
  creadoEn: string;
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export function PantallaFinanzas({ store }: { store: Store }) {
  const hoy = new Date();
  const [mesVista, setMesVista] = useState(hoy.getMonth());
  const [anioVista, setAnioVista] = useState(hoy.getFullYear());
  const [vistaActiva, setVistaActiva] = useState<'mensual' | 'semanal'>('mensual');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [formManual, setFormManual] = useState({ descripcion: '', monto: '', fecha: hoy.toISOString().split('T')[0] });

  const [ingresosManual, setIngresosManual] = useState<IngresoManual[]>([]);

  useEffect(() => {
    supabase.from('ingresos_manual').select('*').order('fecha', { ascending: false })
      .then(({ data }) => setIngresosManual((data ?? []).map((r: any) => ({
        id: r.id, descripcion: r.descripcion, monto: r.monto,
        fecha: r.fecha, creadoEn: r.creado_en,
      }))));
  }, []);

  async function agregarManual() {
    if (!formManual.descripcion || !formManual.monto || !formManual.fecha) return;
    const nuevo: IngresoManual = {
      id: generarId(),
      descripcion: formManual.descripcion,
      monto: Math.round(Number(formManual.monto)),
      fecha: formManual.fecha,
      creadoEn: new Date().toISOString(),
    };
    await supabase.from('ingresos_manual').insert({ id: nuevo.id, descripcion: nuevo.descripcion, monto: nuevo.monto, fecha: nuevo.fecha });
    setIngresosManual(prev => [nuevo, ...prev]);
    setFormManual({ descripcion: '', monto: '', fecha: hoy.toISOString().split('T')[0] });
    setMostrarForm(false);
  }

  async function eliminarManual(id: string) {
    await supabase.from('ingresos_manual').delete().eq('id', id);
    setIngresosManual(prev => prev.filter(i => i.id !== id));
  }

  const citasArr = Array.isArray(store.citas) ? store.citas : [];
  const hoyStr = hoy.toISOString().split('T')[0];

  interface FilaIngreso { id: string; fecha: string; descripcion: string; monto: number; tipo: 'cita' | 'manual'; }

  const todoIngresos: FilaIngreso[] = [
    ...citasArr
      .filter(c => c.estado === 'completada' || c.fecha < hoyStr)
      .map(c => ({
        id: c.id, fecha: c.fecha,
        descripcion: `${c.clienteNombre} — ${SERVICIOS[c.tipo].nombre}`,
        monto: c.precio, tipo: 'cita' as const,
      })),
    ...ingresosManual.map(i => ({ id: i.id, fecha: i.fecha, descripcion: i.descripcion, monto: i.monto, tipo: 'manual' as const })),
  ].sort((a, b) => b.fecha.localeCompare(a.fecha));

  const ingresosMes = todoIngresos.filter(i => {
    const f = new Date(i.fecha + 'T12:00:00');
    return f.getMonth() === mesVista && f.getFullYear() === anioVista;
  });
  const totalMes = ingresosMes.reduce((s, i) => s + i.monto, 0);
  const totalAnio = todoIngresos.filter(i => new Date(i.fecha+'T12:00:00').getFullYear() === anioVista).reduce((s,i) => s+i.monto, 0);

  const resumenAnual = Array.from({ length: 12 }, (_, m) => ({
    mes: MESES[m].slice(0, 3),
    total: todoIngresos.filter(i => { const f = new Date(i.fecha+'T12:00:00'); return f.getMonth()===m && f.getFullYear()===anioVista; }).reduce((s,i)=>s+i.monto,0),
  }));
  const maxMes = Math.max(...resumenAnual.map(m => m.total), 1);

  function getSemanas() {
    return Array.from({ length: 8 }, (_, s) => {
      const inicio = new Date(hoy);
      inicio.setDate(hoy.getDate() - hoy.getDay() - (7 - s) * 7);
      const fin = new Date(inicio); fin.setDate(inicio.getDate() + 6);
      const inicioStr = inicio.toISOString().split('T')[0];
      const finStr = fin.toISOString().split('T')[0];
      return {
        label: `${inicio.getDate()}/${inicio.getMonth()+1}`,
        total: todoIngresos.filter(i => i.fecha >= inicioStr && i.fecha <= finStr).reduce((a,i)=>a+i.monto,0),
        inicio: inicioStr, fin: finStr,
      };
    });
  }
  const semanas = getSemanas();
  const maxSemana = Math.max(...semanas.map(s => s.total), 1);

  const lbl = { fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', marginBottom: 8, display: 'block' };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10, marginBottom: '1.5rem' }}>
        {[
          { label: `${MESES[mesVista]}`, value: formatColones(totalMes) },
          { label: `Año ${anioVista}`, value: formatColones(totalAnio) },
          { label: 'Citas este mes', value: String(ingresosMes.filter(i=>i.tipo==='cita').length) },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value" style={{ fontSize: 18 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Sub-nav */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', alignItems: 'center' }}>
        {(['mensual','semanal'] as const).map(v => (
          <button key={v} onClick={() => setVistaActiva(v)} style={{
            fontSize: 12, padding: '5px 14px', borderRadius: 20, border: '1px solid',
            borderColor: vistaActiva===v ? 'var(--purple)' : 'var(--border-dim)',
            background: vistaActiva===v ? 'var(--purple-bg)' : 'transparent',
            color: vistaActiva===v ? 'var(--purple)' : 'var(--text-muted)',
            cursor: 'pointer', fontWeight: vistaActiva===v ? 700 : 400,
          }}>
            {v === 'mensual' ? 'Mensual' : 'Semanal'}
          </button>
        ))}
        <button className="btn-ghost" style={{ marginLeft: 'auto', fontSize: 12 }} onClick={() => setMostrarForm(v=>!v)}>
          {mostrarForm ? 'Cancelar' : '+ Ingreso manual'}
        </button>
      </div>

      {/* Form manual */}
      {mostrarForm && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem' }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: 'var(--purple)', marginBottom: '1rem' }}>Nuevo ingreso manual</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Descripción</label>
              <input value={formManual.descripcion} onChange={e => setFormManual(p=>({...p,descripcion:e.target.value}))} placeholder="Ej: Lectura extra, abono..." />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Monto (₡)</label>
              <input type="number" value={formManual.monto} onChange={e => setFormManual(p=>({...p,monto:e.target.value}))} placeholder="8000" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Fecha</label>
              <input type="date" value={formManual.fecha} onChange={e => setFormManual(p=>({...p,fecha:e.target.value}))} />
            </div>
          </div>
          <button className="btn-primary" onClick={agregarManual} disabled={!formManual.descripcion || !formManual.monto}>
            Guardar ingreso
          </button>
        </div>
      )}

      {/* MENSUAL */}
      {vistaActiva === 'mensual' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
            <button className="btn-ghost" style={{ fontSize: 18, padding: '2px 10px' }}
              onClick={() => { if(mesVista===0){setMesVista(11);setAnioVista(y=>y-1);}else setMesVista(m=>m-1); }}>‹</button>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 14, color: 'var(--text-primary)', minWidth: 150, textAlign: 'center' }}>
              {MESES[mesVista]} {anioVista}
            </span>
            <button className="btn-ghost" style={{ fontSize: 18, padding: '2px 10px' }}
              onClick={() => { if(mesVista===11){setMesVista(0);setAnioVista(y=>y+1);}else setMesVista(m=>m+1); }}>›</button>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <span style={lbl}>Resumen {anioVista} — click para navegar</span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 80 }}>
              {resumenAnual.map((m, i) => (
                <div key={m.mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer' }}
                  onClick={() => setMesVista(i)}>
                  <div style={{
                    width: '100%', height: Math.max(4, (m.total/maxMes)*64),
                    background: i===mesVista ? 'var(--purple)' : 'var(--purple-bg)',
                    borderRadius: 4, transition: 'all .2s',
                  }} />
                  <span style={{ fontSize: 9, color: i===mesVista ? 'var(--purple)' : 'var(--text-muted)', fontWeight: i===mesVista ? 700 : 400 }}>
                    {m.mes}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {ingresosMes.length === 0 ? (
            <p className="font-serif" style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0', fontStyle: 'italic' }}>
              Sin ingresos en {MESES[mesVista]}.
            </p>
          ) : (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 10, padding: '4px 16px' }}>
              {ingresosMes.map((ingreso, i) => (
                <div key={ingreso.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i<ingresosMes.length-1 ? '1px solid var(--border-dim)' : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{ingreso.descripcion}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(ingreso.fecha+'T12:00:00').toLocaleDateString('es-CR',{day:'numeric',month:'short'})}</p>
                  </div>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: ingreso.tipo==='cita' ? 'var(--purple-bg)' : 'var(--teal-bg)', color: ingreso.tipo==='cita' ? 'var(--purple)' : 'var(--teal)' }}>
                    {ingreso.tipo === 'cita' ? 'Cita' : 'Manual'}
                  </span>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: 'var(--gold)', minWidth: 80, textAlign: 'right' }}>
                    {formatColones(ingreso.monto)}
                  </span>
                  {ingreso.tipo === 'manual' && (
                    <button className="btn-ghost" style={{ fontSize: 11, color: 'var(--danger)', borderColor: 'rgba(158,48,48,0.3)', padding: '2px 8px' }}
                      onClick={() => eliminarManual(ingreso.id)}>×</button>
                  )}
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 4px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Total {MESES[mesVista]}</span>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 15, color: 'var(--purple)' }}>{formatColones(totalMes)}</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* SEMANAL */}
      {vistaActiva === 'semanal' && (
        <>
          <span style={lbl}>Últimas 8 semanas</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 100, marginBottom: '1.5rem' }}>
            {semanas.map((s, i) => (
              <div key={s.inicio} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                {s.total > 0 && <span style={{ fontSize: 9, color: 'var(--purple)', fontWeight: 700 }}>{Math.round(s.total/1000)}k</span>}
                <div style={{ width: '100%', height: Math.max(4,(s.total/maxSemana)*72), background: i===7 ? 'var(--purple)' : 'var(--purple-bg)', borderRadius: 4, transition: 'height .3s' }} />
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{s.label}</span>
              </div>
            ))}
          </div>

          <span style={lbl}>Esta semana</span>
          {(() => {
            const s = semanas[7];
            const estasSemana = todoIngresos.filter(i => i.fecha >= s.inicio && i.fecha <= s.fin);
            const totalSemana = estasSemana.reduce((a,i)=>a+i.monto,0);
            return estasSemana.length === 0 ? (
              <p className="font-serif" style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '1.5rem 0' }}>Sin ingresos esta semana.</p>
            ) : (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', borderRadius: 10, padding: '4px 16px' }}>
                {estasSemana.map((ingreso, i) => (
                  <div key={ingreso.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i<estasSemana.length-1 ? '1px solid var(--border-dim)' : 'none' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{ingreso.descripcion}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(ingreso.fecha+'T12:00:00').toLocaleDateString('es-CR',{weekday:'long',day:'numeric'})}</p>
                    </div>
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: 'var(--gold)' }}>{formatColones(ingreso.monto)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 4px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Total semana</span>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: 15, color: 'var(--purple)' }}>{formatColones(totalSemana)}</span>
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
