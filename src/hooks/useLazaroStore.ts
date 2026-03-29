import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { generarId } from './useLocalStorage';
import type { Cliente, Cita, NotaSesion, TipoLectura, Modalidad } from '../types';
import { SERVICIOS } from '../types';

function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

// Convertir snake_case de Supabase a camelCase
function toCliente(r: any): Cliente {
  return {
    id: r.id, nombre: r.nombre, telefono: r.telefono,
    fechaNacimiento: r.fecha_nacimiento,
    modalidadUsual: r.modalidad_usual,
    intereses: r.intereses ?? [],
    nombresImportantes: r.nombres_importantes ?? [],
    productosTrabajos: r.productos_trabajos ?? [],
    resena: r.resena,
    creadoEn: r.creado_en,
    totalCitas: r.total_citas,
    totalIngresos: r.total_ingresos,
  };
}

function toCita(r: any): Cita {
  return {
    id: r.id, clienteId: r.cliente_id,
    clienteNombre: r.cliente_nombre,
    clienteTelefono: r.cliente_telefono,
    clienteFechaNacimiento: r.cliente_fecha_nacimiento,
    tipo: r.tipo, modalidad: r.modalidad,
    fecha: r.fecha, hora: r.hora,
    intencion: r.intencion, estado: r.estado,
    precio: r.precio, notas: [],
    creadaEn: r.creado_en,
    calEventId: r.cal_event_id,
  };
}

function toNota(r: any): NotaSesion {
  return {
    id: r.id, citaId: r.cita_id, clienteId: r.cliente_id,
    fecha: r.fecha, texto: r.texto, creadaEn: r.creado_en,
  };
}

export function useLazaroStore() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [citas, setCitas]       = useState<Cita[]>([]);
  const [notas, setNotas]       = useState<NotaSesion[]>([]);
  const [cargando, setCargando] = useState(true);

  // Carga inicial
  useEffect(() => {
    async function cargar() {
      setCargando(true);
      const [{ data: c }, { data: ci }, { data: n }] = await Promise.all([
        supabase.from('clientes').select('*').order('creado_en'),
        supabase.from('citas').select('*').order('fecha'),
        supabase.from('notas').select('*').order('fecha'),
      ]);
      setClientes((c ?? []).map(toCliente));
      setCitas((ci ?? []).map(toCita));
      setNotas((n ?? []).map(toNota));
      setCargando(false);
    }
    cargar();
  }, []);

  // ── CLIENTES ──────────────────────────────────────────────

  function getCliente(id: string): Cliente | undefined {
    return clientes.find(c => c.id === id);
  }

  async function actualizarTagsCliente(
    clienteId: string,
    campo: 'intereses' | 'nombresImportantes' | 'productosTrabajos',
    tags: string[]
  ) {
    const col = campo === 'intereses' ? 'intereses'
      : campo === 'nombresImportantes' ? 'nombres_importantes'
      : 'productos_trabajos';
    await supabase.from('clientes').update({ [col]: tags }).eq('id', clienteId);
    setClientes(prev => prev.map(c => c.id === clienteId ? { ...c, [campo]: tags } : c));
  }

  async function guardarResena(clienteId: string, resena: string) {
    await supabase.from('clientes').update({ resena }).eq('id', clienteId);
    setClientes(prev => prev.map(c => c.id === clienteId ? { ...c, resena } : c));
  }

  async function editarCliente(clienteId: string, datos: Partial<Cliente>) {
    const update: any = {};
    if (datos.nombre)          update.nombre           = datos.nombre;
    if (datos.telefono)        update.telefono         = datos.telefono;
    if (datos.fechaNacimiento) update.fecha_nacimiento = datos.fechaNacimiento;
    if (datos.modalidadUsual)  update.modalidad_usual  = datos.modalidadUsual;
    await supabase.from('clientes').update(update).eq('id', clienteId);
    setClientes(prev => prev.map(c => c.id === clienteId ? { ...c, ...datos } : c));
  }

  // ── CITAS ─────────────────────────────────────────────────

  async function agregarCita(datos: {
    clienteNombre: string; clienteTelefono: string; clienteFechaNacimiento: string;
    tipo: TipoLectura; modalidad: Modalidad; fecha: string; hora: string;
    intencion: string; calEventId?: string;
  }): Promise<string> {
    const precio = SERVICIOS[datos.tipo].precio;
    const citaId = generarId();

    // Upsert cliente
    let clienteId = '';
    // Buscar cliente existente por teléfono (si tiene) o por nombre exacto
    const existente = clientes.find(c =>
      (datos.clienteTelefono && c.telefono && c.telefono === datos.clienteTelefono) ||
      (c.nombre.toLowerCase().trim() === datos.clienteNombre.toLowerCase().trim())
    );

    if (existente) {
      clienteId = existente.id;
      await supabase.from('clientes').update({
        total_citas:    existente.totalCitas + 1,
        total_ingresos: existente.totalIngresos + precio,
      }).eq('id', clienteId);
      setClientes(prev => prev.map(c => c.id === clienteId
        ? { ...c, totalCitas: c.totalCitas + 1, totalIngresos: c.totalIngresos + precio }
        : c
      ));
    } else {
      clienteId = generarId();
      const nuevoCliente = {
        id: clienteId,
        nombre: datos.clienteNombre,
        telefono: datos.clienteTelefono,
        fecha_nacimiento: datos.clienteFechaNacimiento,
        modalidad_usual: datos.modalidad,
        intereses: [], nombres_importantes: [], productos_trabajos: [],
        total_citas: 1, total_ingresos: precio,
      };
      await supabase.from('clientes').insert(nuevoCliente);
      setClientes(prev => [...prev, toCliente({ ...nuevoCliente, creado_en: new Date().toISOString() })]);
    }

    const nuevaCita = {
      id: citaId, cliente_id: clienteId,
      cliente_nombre: datos.clienteNombre,
      cliente_telefono: datos.clienteTelefono,
      cliente_fecha_nacimiento: datos.clienteFechaNacimiento,
      tipo: datos.tipo, modalidad: datos.modalidad,
      fecha: datos.fecha, hora: datos.hora,
      intencion: datos.intencion, estado: 'confirmada',
      precio, cal_event_id: datos.calEventId ?? null,
    };
    await supabase.from('citas').insert(nuevaCita);
    setCitas(prev => [...prev, toCita({ ...nuevaCita, creado_en: new Date().toISOString() })]);
    return citaId;
  }

  async function editarCita(citaId: string, datos: Partial<Cita>) {
    const update: any = {};
    if (datos.clienteNombre)          update.cliente_nombre           = datos.clienteNombre;
    if (datos.clienteTelefono)        update.cliente_telefono         = datos.clienteTelefono;
    if (datos.clienteFechaNacimiento) update.cliente_fecha_nacimiento = datos.clienteFechaNacimiento;
    if (datos.tipo)                   update.tipo                     = datos.tipo;
    if (datos.modalidad)              update.modalidad                = datos.modalidad;
    if (datos.fecha)                  update.fecha                    = datos.fecha;
    if (datos.hora)                   update.hora                     = datos.hora;
    if (datos.intencion !== undefined) update.intencion               = datos.intencion;
    if (datos.precio)                 update.precio                   = datos.precio;
    await supabase.from('citas').update(update).eq('id', citaId);
    setCitas(prev => prev.map(c => c.id === citaId ? { ...c, ...datos } : c));
  }

  async function completarCita(citaId: string) {
    await supabase.from('citas').update({ estado: 'completada' }).eq('id', citaId);
    setCitas(prev => prev.map(c => c.id === citaId ? { ...c, estado: 'completada' as const } : c));
  }

  async function cancelarCita(citaId: string) {
    await supabase.from('citas').update({ estado: 'cancelada' }).eq('id', citaId);
    setCitas(prev => prev.map(c => c.id === citaId ? { ...c, estado: 'cancelada' as const } : c));
  }

  async function eliminarCita(citaId: string) {
    await supabase.from('citas').delete().eq('id', citaId);
    setCitas(prev => prev.filter(c => c.id !== citaId));
  }

  function getCitasDeCliente(clienteId: string): Cita[] {
    return citas.filter(c => c.clienteId === clienteId)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  // ── NOTAS ─────────────────────────────────────────────────

  async function agregarNota(citaId: string, clienteId: string, texto: string): Promise<void> {
    if (!texto.trim()) return;
    const nueva = {
      id: generarId(), cita_id: citaId, cliente_id: clienteId,
      fecha: new Date().toISOString(), texto: texto.trim(),
    };
    await supabase.from('notas').insert(nueva);
    setNotas(prev => [...prev, toNota({ ...nueva, creado_en: nueva.fecha })]);
  }

  function getNotasDeCliente(clienteId: string): NotaSesion[] {
    return notas.filter(n => n.clienteId === clienteId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  function getNotasDeCita(citaId: string): NotaSesion[] {
    return notas.filter(n => n.citaId === citaId);
  }

  // ── STATS ─────────────────────────────────────────────────

  function getStats() {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    const hoyStr = hoy.toISOString().split('T')[0];

    const citasMes    = citas.filter(c => new Date(c.fecha) >= inicioMes);
    const citasSemana = citas.filter(c => new Date(c.fecha) >= inicioSemana);
    const ingresosMes = citasMes.reduce((s, c) => s + c.precio, 0);

    const proximasCitas = citas
      .filter(c => c.estado === 'confirmada' && c.fecha >= hoyStr)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    return {
      totalClientes: clientes.length,
      clientesRepiten: clientes.filter(c => c.totalCitas > 1).length,
      citasSemana: citasSemana.length,
      citasMes: citasMes.length,
      ingresosMes,
      proximasCitas,
    };
  }

  return {
    clientes, citas, notas, cargando,
    getCliente, actualizarTagsCliente, guardarResena, editarCliente,
    agregarCita, editarCita, completarCita, cancelarCita, eliminarCita,
    getCitasDeCliente,
    agregarNota, getNotasDeCliente, getNotasDeCita,
    getStats,
  };
}
