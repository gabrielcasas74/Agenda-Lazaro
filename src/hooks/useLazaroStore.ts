import { useLocalStorage, generarId } from './useLocalStorage';
import type { Cliente, Cita, NotaSesion, TipoLectura, Modalidad } from '../types';
import { SERVICIOS } from '../types';

const KEYS = {
  clientes: 'lazaro_clientes',
  citas:    'lazaro_citas',
  notas:    'lazaro_notas',
};

export function useLazaroStore() {
  const [clientes, setClientes] = useLocalStorage<Cliente[]>(KEYS.clientes, []);
  const [citas,    setCitas]    = useLocalStorage<Cita[]>(KEYS.citas, []);
  const [notas,    setNotas]    = useLocalStorage<NotaSesion[]>(KEYS.notas, []);

  const arr = <T>(v: T[] | unknown): T[] => Array.isArray(v) ? v as T[] : [];

  // ── CLIENTES ──────────────────────────────────────────────

  function editarCliente(clienteId: string, datos: Partial<Cliente>) {
    setClientes(prev => arr<Cliente>(prev).map(c =>
      c.id === clienteId ? { ...c, ...datos } : c
    ));
  }

  function actualizarTagsCliente(
    clienteId: string,
    campo: 'intereses' | 'nombresImportantes' | 'productosTrabajos',
    tags: string[]
  ) {
    setClientes(prev => arr<Cliente>(prev).map(c =>
      c.id === clienteId ? { ...c, [campo]: tags } : c
    ));
  }

  function guardarResena(clienteId: string, resena: string) {
    setClientes(prev => arr<Cliente>(prev).map(c =>
      c.id === clienteId ? { ...c, resena } : c
    ));
  }

  function getCliente(id: string): Cliente | undefined {
    return arr<Cliente>(clientes).find(c => c.id === id);
  }

  // ── CITAS ─────────────────────────────────────────────────

  function agregarCita(datos: {
    clienteNombre: string;
    clienteTelefono: string;
    clienteFechaNacimiento: string;
    tipo: TipoLectura;
    modalidad: Modalidad;
    fecha: string;
    hora: string;
    intencion: string;
    calEventId?: string;
  }): string {
    const precio = SERVICIOS[datos.tipo].precio;
    const citaId = generarId();
    let clienteId = '';

    setClientes(prev => {
      const list = arr<Cliente>(prev);
      const existente = list.find(c => c.telefono === datos.clienteTelefono);
      if (existente) {
        clienteId = existente.id;
        return list.map(c =>
          c.id === existente.id
            ? { ...c, totalCitas: c.totalCitas + 1, totalIngresos: c.totalIngresos + precio }
            : c
        );
      }
      clienteId = generarId();
      const nuevo: Cliente = {
        id: clienteId,
        nombre: datos.clienteNombre,
        telefono: datos.clienteTelefono,
        fechaNacimiento: datos.clienteFechaNacimiento,
        modalidadUsual: datos.modalidad,
        intereses: [],
        nombresImportantes: [],
        productosTrabajos: [],
        creadoEn: new Date().toISOString(),
        totalCitas: 1,
        totalIngresos: precio,
      };
      return [...list, nuevo];
    });

    const nuevaCita: Cita = {
      id: citaId,
      clienteId,
      ...datos,
      estado: 'confirmada',
      precio,
      notas: [],
      creadaEn: new Date().toISOString(),
    };
    setCitas(prev => [...arr<Cita>(prev), nuevaCita]);
    return citaId;
  }

  function editarCita(citaId: string, datos: Partial<Cita>) {
    setCitas(prev => arr<Cita>(prev).map(c =>
      c.id === citaId ? { ...c, ...datos } : c
    ));
  }

  function completarCita(citaId: string) {
    setCitas(prev => arr<Cita>(prev).map(c =>
      c.id === citaId ? { ...c, estado: 'completada' as const } : c
    ));
  }

  function getCitasDeCliente(clienteId: string): Cita[] {
    return arr<Cita>(citas)
      .filter(c => c.clienteId === clienteId)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  // ── NOTAS ─────────────────────────────────────────────────

  function agregarNota(citaId: string, clienteId: string, texto: string): void {
    if (!texto.trim()) return;
    const nueva: NotaSesion = {
      id: generarId(),
      citaId,
      clienteId,
      fecha: new Date().toISOString(),
      texto: texto.trim(),
      creadaEn: new Date().toISOString(),
    };
    setNotas(prev => [...arr<NotaSesion>(prev), nueva]);
  }

  function getNotasDeCliente(clienteId: string): NotaSesion[] {
    return arr<NotaSesion>(notas)
      .filter(n => n.clienteId === clienteId)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  function getNotasDeCita(citaId: string): NotaSesion[] {
    return arr<NotaSesion>(notas).filter(n => n.citaId === citaId);
  }

  // ── STATS ─────────────────────────────────────────────────

  function getStats() {
    const citasArr    = arr<Cita>(citas);
    const clientesArr = arr<Cliente>(clientes);
    const hoy         = new Date();
    const hoyStr      = hoy.toISOString().split('T')[0];
    const inicioMes   = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    const semanaStr   = inicioSemana.toISOString().split('T')[0];

    const citasMes    = citasArr.filter(c => c.fecha >= inicioMes);
    const citasSemana = citasArr.filter(c => c.fecha >= semanaStr);
    const ingresosMes = citasMes.reduce((s, c) => s + c.precio, 0);
    const clientesRepiten = clientesArr.filter(c => c.totalCitas > 1).length;

    const proximasCitas = citasArr
      .filter(c => c.estado === 'confirmada' && c.fecha >= hoyStr)
      .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));

    return {
      totalClientes: clientesArr.length,
      clientesRepiten,
      citasSemana:   citasSemana.length,
      citasMes:      citasMes.length,
      ingresosMes,
      proximasCitas,
    };
  }

  return {
    clientes: arr<Cliente>(clientes),
    citas:    arr<Cita>(citas),
    notas:    arr<NotaSesion>(notas),
    // clientes
    editarCliente,
    actualizarTagsCliente,
    guardarResena,
    getCliente,
    // citas
    agregarCita,
    editarCita,
    completarCita,
    getCitasDeCliente,
    // notas
    agregarNota,
    getNotasDeCliente,
    getNotasDeCita,
    // stats
    getStats,
  };
}
