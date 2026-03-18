import { Cotizacion, DatosCotizacion, EstadoCotizacion, Producto } from "@/types/cotizacion";
import {
  cotizacionesStore,
  generateId,
  generateCotizacionId,
  generateConsideracionId,
} from "@/demo/demoStore";
import { DEMO_USER } from "@/demo/demoData";

type CotizacionDB = {
  id: number;
  numero?: string | null;
  codigo?: string | null;
  cliente?: string | null;
  nombre_cliente?: string | null;
  fecha?: string | null;
  fecha_emision?: string | null;
  created_at: string;
  updated_at?: string;
  monto_total?: number | string | null;
  montoTotal?: number | string | null;
  total?: number | string | null;
  monto?: number | string | null;
  estado?: string | null;
  status?: string | null;
  evento?: string | null;
  descuento?: number | string | null;
  user_id?: string | null;
  cuerpo?: CotizacionCuerpoDB[];
  consideraciones?: CotizacionConsideracionDB[];
};

type CotizacionCuerpoDB = {
  id: string;
  cotizacion_id: number;
  servicio_id: number | null;
  producto_id: number | null;
  nombre_servicio: string;
  nombre_producto: string;
  descripcion_producto: string | null;
  cantidad: number | string;
  precio_unitario: number | string;
  subtotal: number | string;
  created_at: string;
};

type CotizacionConsideracionDB = {
  id: number;
  cotizacion_id: number;
  texto: string;
  orden: number | null;
  created_at: string;
};

export type CotizacionDetalle = {
  cotizacion: CotizacionDB;
  cuerpo: CotizacionCuerpoDB[];
  consideraciones: CotizacionConsideracionDB[];
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const normalizeEstado = (value: unknown): EstadoCotizacion => {
  const estado = String(value ?? "").toLowerCase();
  if (estado === "aprobada") return "aprobada";
  if (estado === "pendiente") return "pendiente";
  if (estado === "rechazada") return "rechazada";
  if (estado === "expirada") return "expirada";
  return "pendiente";
};

const formatFecha = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return value;
  }
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("es-CO");
};

const generateNumero = (id: number): string => {
  return `COT-${id.toString().padStart(5, "0")}`;
};

const parseProductoId = (producto: Producto): number | null => {
  if (typeof producto.productoId === "number") return producto.productoId;
  const parsed = Number(producto.id);
  return Number.isFinite(parsed) ? parsed : null;
};

const calcularTotal = (productos: Producto[], descuento: number) => {
  const subtotal = productos.reduce(
    (acc, producto) => acc + producto.cantidad * producto.precioUnitario,
    0
  );
  const total = subtotal * (1 - Math.min(Math.max(descuento, 0), 100) / 100);
  return { subtotal, total };
};

const toAppFormat = (cotizacion: CotizacionDB): Cotizacion => {
  const idBase = cotizacion.id ?? cotizacion.created_at;
  return {
    id: String(idBase),
    numero: cotizacion.numero ?? cotizacion.codigo ?? generateNumero(cotizacion.id),
    cliente: cotizacion.cliente ?? cotizacion.nombre_cliente ?? "Sin cliente",
    fecha: formatFecha(cotizacion.created_at ?? ""),
    montoTotal: toNumber(
      cotizacion.monto_total ??
        cotizacion.montoTotal ??
        cotizacion.total ??
        cotizacion.monto ??
        0
    ),
    estado: normalizeEstado(cotizacion.estado ?? cotizacion.status),
  };
};

const toDatosCotizacion = (cotizacionDB: CotizacionDB): DatosCotizacion => {
  const productos: Producto[] = (cotizacionDB.cuerpo || []).map((item) => ({
    id: item.id,
    descripcion: item.nombre_producto || item.descripcion_producto || "",
    cantidad: toNumber(item.cantidad) || 1,
    precioUnitario: toNumber(item.precio_unitario) || 0,
    productoId: item.producto_id,
    servicioId: item.servicio_id,
    nombreServicio: item.nombre_servicio,
    descripcionProducto: item.descripcion_producto,
    precioVariable: toNumber(item.precio_unitario) === 0,
  }));

  const consideraciones = (cotizacionDB.consideraciones || [])
    .sort((a, b) => (a.orden || 0) - (b.orden || 0))
    .map((c) => c.texto)
    .join("\n");

  return {
    cliente: cotizacionDB.nombre_cliente || cotizacionDB.cliente || "",
    evento: cotizacionDB.evento || "",
    consideraciones,
    descuento: toNumber(cotizacionDB.descuento) || 0,
    fecha: cotizacionDB.fecha || "",
    nombreEncargado: "",
    cargo: "",
    productos,
  };
};

// ==========================================
// FUNCIONES EXPORTADAS
// ==========================================

export const obtenerCotizaciones = async (): Promise<Cotizacion[]> => {
  const sorted = [...cotizacionesStore].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return sorted.map((c) => toAppFormat(c as unknown as CotizacionDB));
};

export const obtenerCotizacionDetalle = async (
  id: number | string
): Promise<CotizacionDetalle> => {
  const cotizacionId = Number(id);
  if (!Number.isFinite(cotizacionId)) {
    throw new Error("ID de cotización inválido");
  }

  const cotizacion = cotizacionesStore.find((c) => c.id === cotizacionId);
  if (!cotizacion) {
    throw new Error("No se pudo obtener la cotización");
  }

  return {
    cotizacion: cotizacion as unknown as CotizacionDB,
    cuerpo: [...cotizacion.cuerpo] as unknown as CotizacionCuerpoDB[],
    consideraciones: [...cotizacion.consideraciones] as unknown as CotizacionConsideracionDB[],
  };
};

export const crearCotizacion = async (
  datos: DatosCotizacion,
  productos: Producto[]
): Promise<number> => {
  const descuento = datos.descuento ?? 0;
  const { total } = calcularTotal(productos, descuento);
  const cotizacionId = generateCotizacionId();
  const now = new Date().toISOString();

  const cuerpo = productos.map((producto) => ({
    id: generateId(),
    cotizacion_id: cotizacionId,
    servicio_id: producto.servicioId ?? null,
    producto_id: parseProductoId(producto),
    nombre_servicio: producto.nombreServicio || "Servicio",
    nombre_producto: producto.descripcion || "Producto",
    descripcion_producto: producto.descripcionProducto ?? null,
    cantidad: producto.cantidad,
    precio_unitario: producto.precioUnitario,
    subtotal: producto.cantidad * producto.precioUnitario,
    created_at: now,
  }));

  const consideraciones = datos.consideraciones
    .split(/\r?\n/)
    .map((linea) => linea.trim())
    .filter(Boolean)
    .map((texto, index) => ({
      id: generateConsideracionId(),
      cotizacion_id: cotizacionId,
      texto,
      orden: index + 1,
      created_at: now,
    }));

  cotizacionesStore.unshift({
    id: cotizacionId,
    numero: generateNumero(cotizacionId),
    nombre_cliente: datos.cliente,
    evento: datos.evento || "",
    descuento,
    fecha: datos.fecha || null,
    total,
    estado: "pendiente",
    created_at: now,
    updated_at: now,
    user_id: DEMO_USER.id,
    cuerpo,
    consideraciones,
  });

  return cotizacionId;
};

export class CotizacionesService {
  static async obtenerTodas(): Promise<Cotizacion[]> {
    return obtenerCotizaciones();
  }

  static async obtenerPorId(id: number): Promise<DatosCotizacion | null> {
    const cotizacion = cotizacionesStore.find((c) => c.id === id);
    if (!cotizacion) return null;
    return toDatosCotizacion(cotizacion as unknown as CotizacionDB);
  }

  static async obtenerClientes(): Promise<string[]> {
    const clientes = cotizacionesStore
      .map((c) => c.nombre_cliente)
      .filter((c): c is string => c !== null && c.trim() !== "");
    return [...new Set(clientes)];
  }

  static async eliminar(id: number): Promise<boolean> {
    const index = cotizacionesStore.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error("No se encontró la cotización");
    }
    cotizacionesStore.splice(index, 1);
    return true;
  }
}
