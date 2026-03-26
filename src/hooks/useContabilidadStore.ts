import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { generarId } from './useLocalStorage';
import type { ClienteContable, DeclaracionCliente, PagoHonorario, EstadoCliente } from '../types/contabilidad';

function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function toClienteContable(r: any): ClienteContable {
  return {
    id: r.id, nombre: r.nombre, cedula: r.cedula,
    telefono: r.telefono, email: r.email,
    honorariosMensuales: r.honorarios_mensuales,
    estado: r.estado, notas: r.notas,
    declaraciones: [], pagos: [],
    creadoEn: r.creado_en,
  };
}

function toDeclaracion(r: any): DeclaracionCliente {
  return {
    id: r.id, clienteId: r.cliente_id, tipo: r.tipo,
    descripcion: r.descripcion,
    fechaPersonalizada: r.fecha_personalizada,
    periodicidad: r.periodicidad,
    completada: r.completada,
    ultimaCompletada: r.ultima_completada,
    notas: r.notas,
  };
}

function toPago(r: any): PagoHonorario {
  return {
    id: r.id, clienteId: r.cliente_id,
    mes: r.mes, anio: r.anio, monto: r.monto,
    pagado: r.pagado, fechaPago: r.fecha_pago, notas: r.notas,
  };
}

export function useContabilidadStore() {
  const [clientes,      setClientes]      = useState<ClienteContable[]>([]);
  const [declaraciones, setDeclaraciones] = useState<DeclaracionCliente[]>([]);
  const [pagos,         setPagos]         = useState<PagoHonorario[]>([]);
  const [cargando,      setCargando]      = useState(true);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      const [{ data: c }, { data: d }, { data: p }] = await Promise.all([
        supabase.from('clientes_contables').select('*').order('nombre'),
        supabase.from('declaraciones').select('*'),
        supabase.from('pagos_honorarios').select('*'),
      ]);
      setClientes((c ?? []).map(toClienteContable));
      setDeclaraciones((d ?? []).map(toDeclaracion));
      setPagos((p ?? []).map(toPago));
      setCargando(false);
    }
    cargar();
  }, []);

  function getCliente(id: string): ClienteContable | undefined {
    return clientes.find(c => c.id === id);
  }

  async function agregarCliente(datos: Omit<ClienteContable, 'id' | 'declaraciones' | 'pagos' | 'creadoEn'>): Promise<string> {
    const id = generarId();
    const row = {
      id, nombre: datos.nombre, cedula: datos.cedula,
      telefono: datos.telefono, email: datos.email,
      honorarios_mensuales: datos.honorariosMensuales,
      estado: datos.estado, notas: datos.notas,
    };
    await supabase.from('clientes_contables').insert(row);
    setClientes(prev => [...prev, toClienteContable({ ...row, creado_en: new Date().toISOString() })]);
    return id;
  }

  async function editarCliente(id: string, datos: Partial<ClienteContable>) {
    const update: any = {};
    if (datos.nombre     !== undefined) update.nombre               = datos.nombre;
    if (datos.cedula     !== undefined) update.cedula               = datos.cedula;
    if (datos.telefono   !== undefined) update.telefono             = datos.telefono;
    if (datos.email      !== undefined) update.email                = datos.email;
    if (datos.honorariosMensuales !== undefined) update.honorarios_mensuales = datos.honorariosMensuales;
    if (datos.estado     !== undefined) update.estado               = datos.estado;
    if (datos.notas      !== undefined) update.notas                = datos.notas;
    await supabase.from('clientes_contables').update(update).eq('id', id);
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...datos } : c));
  }

  async function agregarDeclaracion(clienteId: string, datos: Omit<DeclaracionCliente, 'id' | 'clienteId' | 'completada' | 'ultimaCompletada'>): Promise<string> {
    const id = generarId();
    const row = {
      id, cliente_id: clienteId, tipo: datos.tipo,
      descripcion: datos.descripcion,
      fecha_personalizada: datos.fechaPersonalizada,
      periodicidad: datos.periodicidad,
      completada: false, ultima_completada: null,
      notas: datos.notas,
    };
    await supabase.from('declaraciones').insert(row);
    setDeclaraciones(prev => [...prev, toDeclaracion(row)]);
    return id;
  }

  async function marcarDeclaracion(id: string, completada: boolean) {
    const ultima = completada ? new Date().toISOString() : null;
    await supabase.from('declaraciones').update({ completada, ultima_completada: ultima }).eq('id', id);
    setDeclaraciones(prev => prev.map(d => d.id === id ? { ...d, completada, ultimaCompletada: ultima } : d));
  }

  async function editarDeclaracion(id: string, datos: Partial<DeclaracionCliente>) {
    const update: any = {};
    if (datos.descripcion        !== undefined) update.descripcion         = datos.descripcion;
    if (datos.fechaPersonalizada !== undefined) update.fecha_personalizada = datos.fechaPersonalizada;
    if (datos.notas              !== undefined) update.notas               = datos.notas;
    await supabase.from('declaraciones').update(update).eq('id', id);
    setDeclaraciones(prev => prev.map(d => d.id === id ? { ...d, ...datos } : d));
  }

  async function eliminarDeclaracion(id: string) {
    await supabase.from('declaraciones').delete().eq('id', id);
    setDeclaraciones(prev => prev.filter(d => d.id !== id));
  }

  function getDeclaracionesCliente(clienteId: string): DeclaracionCliente[] {
    return declaraciones.filter(d => d.clienteId === clienteId);
  }

  async function togglePago(clienteId: string, mes: number, anio: number, monto: number) {
    const existing = pagos.find(p => p.clienteId === clienteId && p.mes === mes && p.anio === anio);
    if (existing) {
      const pagado = !existing.pagado;
      const fechaPago = pagado ? new Date().toISOString() : null;
      await supabase.from('pagos_honorarios').update({ pagado, fecha_pago: fechaPago }).eq('id', existing.id);
      setPagos(prev => prev.map(p => p.id === existing.id ? { ...p, pagado, fechaPago } : p));
    } else {
      const id = generarId();
      const row = { id, cliente_id: clienteId, mes, anio, monto, pagado: true, fecha_pago: new Date().toISOString(), notas: '' };
      await supabase.from('pagos_honorarios').insert(row);
      setPagos(prev => [...prev, toPago(row)]);
    }
  }

  function getPagosCliente(clienteId: string): PagoHonorario[] {
    return pagos.filter(p => p.clienteId === clienteId);
  }

  function getPagoMes(clienteId: string, mes: number, anio: number): PagoHonorario | undefined {
    return pagos.find(p => p.clienteId === clienteId && p.mes === mes && p.anio === anio);
  }

  function getStats() {
    const hoy = new Date();
    const mes = hoy.getMonth();
    const anio = hoy.getFullYear();
    const totalHonorarios  = clientes.reduce((s, c) => s + c.honorariosMensuales, 0);
    const pagadosMes       = pagos.filter(p => p.mes === mes && p.anio === anio && p.pagado).reduce((s, p) => s + p.monto, 0);
    const pendientesMes    = clientes.filter(c => !pagos.find(p => p.clienteId === c.id && p.mes === mes && p.anio === anio && p.pagado)).reduce((s, c) => s + c.honorariosMensuales, 0);
    return {
      totalClientes:  clientes.length,
      alDia:          clientes.filter(c => c.estado === 'al_dia').length,
      pendientes:     clientes.filter(c => c.estado === 'pendiente').length,
      atrasados:      clientes.filter(c => c.estado === 'atrasado').length,
      totalHonorarios, pagadosMes, pendientesMes,
    };
  }

  return {
    clientes, declaraciones, pagos, cargando,
    getCliente, agregarCliente, editarCliente,
    agregarDeclaracion, marcarDeclaracion, editarDeclaracion, eliminarDeclaracion, getDeclaracionesCliente,
    togglePago, getPagosCliente, getPagoMes,
    getStats,
  };
}
