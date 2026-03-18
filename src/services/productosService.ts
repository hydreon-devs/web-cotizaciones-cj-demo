import { ProductoServicio } from "@/types/cotizacion";
import { productosStore, generateProductoId } from "@/demo/demoStore";

type ProductoInput = {
  id_servicio: number;
  nombre: string;
  descripcion?: string | null;
  precio?: number | null;
  estado?: string | null;
};

export const obtenerProductos = async (idServicio?: number): Promise<ProductoServicio[]> => {
  let lista = [...productosStore];
  if (idServicio) {
    lista = lista.filter((p) => p.id_servicio === idServicio);
  }
  return lista.sort((a, b) => (a.nombre ?? "").localeCompare(b.nombre ?? ""));
};

export const crearProducto = async (payload: ProductoInput): Promise<ProductoServicio> => {
  const now = new Date().toISOString();
  const nuevo: ProductoServicio = {
    id: generateProductoId(),
    id_servicio: payload.id_servicio,
    nombre: payload.nombre,
    descripcion: payload.descripcion ?? null,
    precio: payload.precio ?? null,
    estado: payload.estado ?? "activo",
    created_at: now,
    updated_at: now,
  };
  productosStore.push(nuevo);
  return { ...nuevo };
};

export const actualizarProducto = async (
  id: number,
  payload: ProductoInput
): Promise<ProductoServicio> => {
  const index = productosStore.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error("No se pudo actualizar el producto");
  }
  const now = new Date().toISOString();
  productosStore[index] = {
    ...productosStore[index],
    id_servicio: payload.id_servicio,
    nombre: payload.nombre,
    descripcion: payload.descripcion ?? null,
    precio: payload.precio ?? null,
    estado: payload.estado ?? null,
    updated_at: now,
  };
  return { ...productosStore[index] };
};

export const eliminarProducto = async (id: number): Promise<void> => {
  const index = productosStore.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error("No se pudo eliminar el producto");
  }
  productosStore.splice(index, 1);
};

export const eliminarProductosPorServicio = async (idServicio: number): Promise<void> => {
  let i = productosStore.length - 1;
  while (i >= 0) {
    if (productosStore[i].id_servicio === idServicio) {
      productosStore.splice(i, 1);
    }
    i--;
  }
};
