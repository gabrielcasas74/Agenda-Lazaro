import { useLocalStorage, generarId } from './useLocalStorage';
import type { ClienteContable, DeclaracionCliente, PagoHonorario, EstadoCliente, TipoDeclaracion } from '../types/contabilidad';

const KEYS = {
  clientes: 'conta_clientes',
  declaraciones: 'conta_declaraciones',
  pagos: 'conta_pagos',
};

function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export function useContabilidadStore() {
  const [clientes, setClientes]         = useLocalStorage<ClienteContable[]>(KEYS.clientes, []);
  const [declaraciones, setDeclaraciones] = useLocalStorage<DeclaracionCliente[]>(KEYS.declaraciones, []);
  const [pagos, setPagos]               = useLocalStorage<PagoHonorario[]>(KEYS.pagos, []);

  // ── CLIENTES ──────────────────────────────────────────────

  function agregarCliente(datos: Omit<ClienteContable, 'id' | 'declaraciones' | 'pagos' | 'creadoEn'>): string {
    const id = generarId();
    const nuevo: ClienteContable = { ...datos, id, declaraciones: [], pagos: [], creadoEn: new Date().toISOString() };
    setClientes(prev => [...arr<ClienteContable>(prev), nuevo]);
    return id;
  }

  function editarCliente(id: string, datos: Partial<ClienteContable>) {
    setClientes(prev => arr<ClienteContable>(prev).map(c => c.id === id ? { ...c, ...datos } : c));
  }

  function getCliente(id: string): ClienteContable | undefined {
    return arr<ClienteContable>(clientes).find(c => c.id === id);
  }

  // ── DECLARACIONES ─────────────────────────────────────────

  function agregarDeclaracion(clienteId: string, datos: Omit<DeclaracionCliente, 'id' | 'clienteId' | 'completada' | 'ultimaCompletada'>): string {
    const id = generarId();
    const nueva: DeclaracionCliente = { ...datos, id, clienteId, completada: false, ultimaCompletada: null };
    setDeclaraciones(prev => [...arr<DeclaracionCliente>(prev), nueva]);
    return id;
  }

  function marcarDeclaracion(id: string, completada: boolean) {
    setDeclaraciones(prev => arr<DeclaracionCliente>(prev).map(d =>
      d.id === id ? { ...d, completada, ultimaCompletada: completada ? new Date().toISOString() : d.ultimaCompletada } : d
    ));
  }

  function editarDeclaracion(id: string, datos: Partial<DeclaracionCliente>) {
    setDeclaraciones(prev => arr<DeclaracionCliente>(prev).map(d => d.id === id ? { ...d, ...datos } : d));
  }

  function eliminarDeclaracion(id: string) {
    setDeclaraciones(prev => arr<DeclaracionCliente>(prev).filter(d => d.id !== id));
  }

  function getDeclaracionesCliente(clienteId: string): DeclaracionCliente[] {
    return arr<DeclaracionCliente>(declaraciones).filter(d => d.clienteId === clienteId);
  }

  // ── PAGOS DE HONORARIOS ───────────────────────────────────

  function togglePago(clienteId: string, mes: number, anio: number, monto: number) {
    const existing = arr<PagoHonorario>(pagos).find(p => p.clienteId === clienteId && p.mes === mes && p.anio === anio);
    if (existing) {
      setPagos(prev => arr<PagoHonorario>(prev).map(p =>
        p.id === existing.id ? { ...p, pagado: !p.pagado, fechaPago: !p.pagado ? new Date().toISOString() : null } : p
      ));
    } else {
      const nuevo: PagoHonorario = {
        id: generarId(), clienteId, mes, anio, monto,
        pagado: true, fechaPago: new Date().toISOString(), notas: '',
      };
      setPagos(prev => [...arr<PagoHonorario>(prev), nuevo]);
    }
  }

  function getPagosCliente(clienteId: string): PagoHonorario[] {
    return arr<PagoHonorario>(pagos).filter(p => p.clienteId === clienteId);
  }

  function getPagoMes(clienteId: string, mes: number, anio: number): PagoHonorario | undefined {
    return arr<PagoHonorario>(pagos).find(p => p.clienteId === clienteId && p.mes === mes && p.anio === anio);
  }

  // ── STATS ─────────────────────────────────────────────────

  function getStats() {
    const clientesArr = arr<ClienteContable>(clientes);
    const hoy = new Date();
    const mes = hoy.getMonth();
    const anio = hoy.getFullYear();

    const totalHonorarios = clientesArr.reduce((s, c) => s + c.honorariosMensuales, 0);
    const pagadosMes = arr<PagoHonorario>(pagos)
      .filter(p => p.mes === mes && p.anio === anio && p.pagado)
      .reduce((s, p) => s + p.monto, 0);
    const pendientesMes = clientesArr
      .filter(c => !arr<PagoHonorario>(pagos).find(p => p.clienteId === c.id && p.mes === mes && p.anio === anio && p.pagado))
      .reduce((s, c) => s + c.honorariosMensuales, 0);

    return {
      totalClientes: clientesArr.length,
      alDia:      clientesArr.filter(c => c.estado === 'al_dia').length,
      pendientes: clientesArr.filter(c => c.estado === 'pendiente').length,
      atrasados:  clientesArr.filter(c => c.estado === 'atrasado').length,
      totalHonorarios,
      pagadosMes,
      pendientesMes,
    };
  }

  return {
    clientes:      arr<ClienteContable>(clientes),
    declaraciones: arr<DeclaracionCliente>(declaraciones),
    pagos:         arr<PagoHonorario>(pagos),
    agregarCliente, editarCliente, getCliente,
    agregarDeclaracion, marcarDeclaracion, editarDeclaracion, eliminarDeclaracion, getDeclaracionesCliente,
    togglePago, getPagosCliente, getPagoMes,
    getStats,
  };
}
