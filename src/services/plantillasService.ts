import {
  PlantillaCotizacion,
  DatosCotizacion,
  Producto,
  PlantillaDB,
} from "@/types/cotizacion";
import { plantillasStore, generateId } from "@/demo/demoStore";
import { DEMO_USER } from "@/demo/demoData";

function toAppFormat(plantillaDB: PlantillaDB): PlantillaCotizacion {
  const productos: Producto[] = [];

  if (plantillaDB.servicios) {
    for (const servicio of plantillaDB.servicios) {
      if (servicio.productos) {
        for (const producto of servicio.productos) {
          productos.push({
            id: producto.id,
            descripcion: producto.nombre_producto,
            cantidad: producto.cantidad,
            precioUnitario: producto.precio_unitario,
            productoId: producto.producto_id ?? null,
            servicioId: servicio.servicio_id ?? null,
            nombreServicio: servicio.nombre_servicio || "Servicio",
            descripcionProducto: producto.descripcion_producto ?? null,
            precioVariable: producto.precio_unitario === 0,
          });
        }
      }
    }
  }

  const datos: DatosCotizacion = {
    cliente: "",
    evento: "",
    consideraciones: "",
    descuento: plantillaDB.descuento ?? 0,
    fecha: "",
    nombreEncargado: "",
    cargo: "",
    productos,
  };

  return {
    id: plantillaDB.id,
    nombre: plantillaDB.nombre,
    descripcion: plantillaDB.descripcion || "",
    icono: "FileText",
    color: "bg-blue-500",
    autor: "Sistema",
    fechaCreacion: plantillaDB.created_at,
    datos,
  };
}

export class PlantillasService {
  static async obtenerTodas(): Promise<PlantillaCotizacion[]> {
    return plantillasStore
      .filter((p) => p.activo)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(toAppFormat);
  }

  static async obtenerPorId(id: string): Promise<PlantillaCotizacion | null> {
    const plantilla = plantillasStore.find((p) => p.id === id);
    if (!plantilla) return null;
    return toAppFormat(plantilla);
  }

  static async crear(
    nombre: string,
    descripcion: string,
    datos: DatosCotizacion,
    _autor: string,
    _icono: string = "FileText",
    _color: string = "bg-gray-500"
  ): Promise<PlantillaCotizacion> {
    if (!nombre) {
      throw new Error("El nombre es requerido");
    }

    const plantillaId = generateId();
    const now = new Date().toISOString();

    // Agrupar productos por servicio
    const productosPorServicio = datos.productos.reduce(
      (acc, producto) => {
        const key =
          producto.servicioId?.toString() || producto.nombreServicio || "Sin servicio";
        const nombreServicio = producto.nombreServicio || "Sin servicio";

        if (!acc[key]) {
          acc[key] = {
            servicioId: producto.servicioId ?? null,
            nombreServicio,
            productos: [],
          };
        }
        acc[key].productos.push(producto);
        return acc;
      },
      {} as Record<string, { servicioId: number | null; nombreServicio: string; productos: Producto[] }>
    );

    const servicios = Object.values(productosPorServicio).map((grupo, orden) => {
      const plantillaServicioId = generateId();
      return {
        id: plantillaServicioId,
        plantilla_id: plantillaId,
        servicio_id: grupo.servicioId,
        nombre_servicio: grupo.nombreServicio,
        descripcion_servicio: `Productos de ${grupo.nombreServicio}`,
        orden: orden + 1,
        created_at: now,
        productos: grupo.productos.map((producto) => ({
          id: generateId(),
          plantilla_servicio_id: plantillaServicioId,
          producto_id: producto.productoId ?? null,
          nombre_producto: producto.descripcion,
          descripcion_producto: producto.descripcionProducto ?? producto.descripcion,
          cantidad: producto.cantidad,
          precio_unitario: producto.precioUnitario,
          subtotal: producto.cantidad * producto.precioUnitario,
          created_at: now,
        })),
      };
    });

    const nueva: PlantillaDB = {
      id: plantillaId,
      nombre,
      descripcion,
      es_publica: true,
      version: 1,
      activo: true,
      user_id: DEMO_USER.id,
      descuento: datos.descuento ?? 0,
      created_at: now,
      updated_at: now,
      servicios,
    };

    plantillasStore.unshift(nueva);

    return toAppFormat(nueva);
  }

  static async actualizar(
    id: string,
    actualizaciones: Partial<Omit<PlantillaCotizacion, "id" | "fechaCreacion">>
  ): Promise<PlantillaCotizacion> {
    const index = plantillasStore.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`No se encontró la plantilla con ID: ${id}`);
    }

    const now = new Date().toISOString();
    if (actualizaciones.nombre) {
      plantillasStore[index].nombre = actualizaciones.nombre;
    }
    if (actualizaciones.descripcion !== undefined) {
      plantillasStore[index].descripcion = actualizaciones.descripcion;
    }
    if (actualizaciones.datos?.descuento !== undefined) {
      plantillasStore[index].descuento = actualizaciones.datos.descuento;
    }
    plantillasStore[index].updated_at = now;

    return toAppFormat(plantillasStore[index]);
  }

  static async eliminar(id: string): Promise<boolean> {
    const index = plantillasStore.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`No se pudo eliminar la plantilla con ID: ${id}`);
    }
    plantillasStore.splice(index, 1);
    return true;
  }
}
