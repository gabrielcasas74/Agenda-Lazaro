import { useLocalStorage, generarId } from './useLocalStorage';
import type { Cliente, Cita, NotaSesion, TipoLectura, Modalidad } from '../types';
import { SERVICIOS } from '../types';

const KEYS = {
  clientes: 'lazaro_clientes',
  citas: 'lazaro_citas',
  notas: 'lazaro_notas',
};

export function useLazaroStore() {
  const [clientes, setClientes] = useLocalStorage<Cliente[]>(KEYS.clientes, []);
  const [citas, setCitas] = useLocalStorage<Cita[]>(KEYS.citas, []);
  const [notas, setNotas] = useLocalStorage<NotaSesion[]>(KEYS.notas, []);

  // ── CLIENTES ──────────────────────────────────────────────

  function actualizarTagsCliente(
    clienteId: string,
    campo: 'intereses' | 'nombresImportantes' | 'productosTrabajos',
    tags: string[]
  ) {
    setClientes(prev =>
      (Array.isArray(prev) ? prev : []).map(c =>
        c.id === clienteId ? { ...c, [campo]: tags } : c
      )
    );
  }

  function getCliente(id: string): Cliente | undefined {
    return (Array.isArray(clientes) ? clientes : []).find(c => c.id === id);
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

    // Operación atómica: crear o actualizar cliente en un solo setClientes
    setClientes(prev => {
      const arr = Array.isArray(prev) ? prev : [];
      const existente = arr.find(c => c.telefono === datos.clienteTelefono);

      if (existente) {
        clienteId = existente.id;
        return arr.map(c =>
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
      return [...arr, nuevo];
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

    setCitas(prev => Array.isArray(prev) ? [...prev, nuevaCita] : [nuevaCita]);
    return citaId;
  }

  function completarCita(citaId: string) {
    setCitas(prev =>
      (Array.isArray(prev) ? prev : []).map(c =>
        c.id === citaId ? { ...c, estado: 'completada' as const } : c
      )
    );
  }

  function getCitasDeCliente(clienteId: string): Cita[] {
    return (Array.isArray(citas) ? citas : [])
      .filter(c => c.clienteId === clienteId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
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
    setNotas(prev => Array.isArray(prev) ? [...prev, nueva] : [nueva]);
  }

  function getNotasDeCliente(clienteId: string): NotaSesion[] {
    return (Array.isArray(notas) ? notas : [])
      .filter(n => n.clienteId === clienteId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  function getNotasDeCita(citaId: string): NotaSesion[] {
    return (Array.isArray(notas) ? notas : []).filter(n => n.citaId === citaId);
  }

  // ── STATS ─────────────────────────────────────────────────

  function getStats() {
    const citasArr = Array.isArray(citas) ? citas : [];
    const clientesArr = Array.isArray(clientes) ? clientes : [];
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());

    const citasMes = citasArr.filter(c => new Date(c.fecha) >= inicioMes);
    const citasSemana = citasArr.filter(c => new Date(c.fecha) >= inicioSemana);
    const ingresosMes = citasMes.reduce((sum, c) => sum + c.precio, 0);
    const clientesRepiten = clientesArr.filter(c => c.totalCitas > 1).length;

    const proximasCitas = citasArr
      .filter(c => c.estado === 'confirmada' && new Date(c.fecha) >= new Date(hoy.toDateString()))
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    return {
      totalClientes: clientesArr.length,
      clientesRepiten,
      citasSemana: citasSemana.length,
      citasMes: citasMes.length,
      ingresosMes,
      proximasCitas,
    };
  }

  return {
    clientes: Array.isArray(clientes) ? clientes : [],
    citas: Array.isArray(citas) ? citas : [],
    notas: Array.isArray(notas) ? notas : [],
    actualizarTagsCliente,
    getCliente,
    agregarCita,
    completarCita,
    getCitasDeCliente,
    agregarNota,
    getNotasDeCliente,
    getNotasDeCita,
    getStats,
  };
}
