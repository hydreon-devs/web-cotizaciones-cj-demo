import { supabase } from "@/api/conection";
import { ProductoServicio } from "@/types/cotizacion";

type ProductoDB = {
  id: number;
  id_servicio: number;
  nombre: string | null;
  descripcion: string | null;
  precio: number | null;
  estado: string | null;
  created_at: string;
  updated_at: string;
};

type ProductoInput = {
  id_servicio: number;
  nombre: string;
  descripcion?: string | null;
  precio?: number | null;
  estado?: string | null;
};

export const obtenerProductos = async (idServicio?: number): Promise<ProductoServicio[]> => {
  let query = supabase.from("productos").select("*").order("nombre", { ascending: true });

  if (idServicio) {
    query = query.eq("id_servicio", idServicio);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error al obtener productos:", error);
    throw new Error("No se pudieron obtener los productos");
  }

  return (data ?? []).map((producto) => {
    const item = producto as ProductoDB;
    return {
      id: item.id,
      id_servicio: item.id_servicio,
      nombre: item.nombre,
      descripcion: item.descripcion,
      precio: item.precio,
      estado: item.estado,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  });
};

export const crearProducto = async (payload: ProductoInput): Promise<ProductoServicio> => {
  const { data, error } = await supabase
    .from("productos")
    .insert({
      id_servicio: payload.id_servicio,
      nombre: payload.nombre,
      descripcion: payload.descripcion ?? null,
      precio: payload.precio ?? null,
      estado: payload.estado ?? "activo",
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error al crear producto:", error);
    if (error.code === "23505") {
      throw new Error("El producto ya existe");
    }
    throw new Error("No se pudo crear el producto");
  }

  return data as ProductoServicio;
};

export const actualizarProducto = async (
  id: number,
  payload: ProductoInput
): Promise<ProductoServicio> => {
  const { data, error } = await supabase
    .from("productos")
    .update({
      id_servicio: payload.id_servicio,
      nombre: payload.nombre,
      descripcion: payload.descripcion ?? null,
      precio: payload.precio ?? null,
      estado: payload.estado ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Error al actualizar producto:", error);
    throw new Error("No se pudo actualizar el producto");
  }

  return data as ProductoServicio;
};

export const eliminarProducto = async (id: number): Promise<void> => {
  const { error } = await supabase.from("productos").delete().eq("id", id);

  if (error) {
    console.error("Error al eliminar producto:", error);
    throw new Error("No se pudo eliminar el producto");
  }
};

export const eliminarProductosPorServicio = async (idServicio: number): Promise<void> => {
  const { error } = await supabase.from("productos").delete().eq("id_servicio", idServicio);

  if (error) {
    console.error("Error al eliminar productos del servicio:", error);
    throw new Error("No se pudieron eliminar los productos del servicio");
  }
};
