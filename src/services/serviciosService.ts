import { supabase } from "@/api/conection";
import { Servicio } from "@/types/cotizacion";

type ServicioDB = {
  id: number;
  nombre: string | null;
  descripcion: string | null;
  estado: string | null;
  created_at: string;
  updated_at: string;
};

export const obtenerServicios = async (): Promise<Servicio[]> => {
  const { data, error } = await supabase
    .from("servicios")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error al obtener servicios:", error);
    throw new Error("No se pudieron obtener los servicios");
  }

  return (data ?? []).map((servicio) => {
    const item = servicio as ServicioDB;
    return {
      id: item.id,
      nombre: item.nombre,
      descripcion: item.descripcion,
      estado: item.estado,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  });
};

type ServicioInput = {
  nombre: string;
  descripcion?: string | null;
  estado?: string | null;
};

export const crearServicio = async (payload: ServicioInput): Promise<Servicio> => {
  const { data, error } = await supabase
    .from("servicios")
    .insert({
      nombre: payload.nombre,
      descripcion: payload.descripcion ?? null,
      estado: payload.estado ?? "activo",
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error al crear servicio:", error);
    if (error.code === "23505") {
      throw new Error("El servicio ya existe");
    }
    throw new Error("No se pudo crear el servicio");
  }

  return data as Servicio;
};

export const actualizarServicio = async (
  id: number,
  payload: ServicioInput
): Promise<Servicio> => {
  const { data, error } = await supabase
    .from("servicios")
    .update({
      nombre: payload.nombre,
      descripcion: payload.descripcion ?? null,
      estado: payload.estado ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Error al actualizar servicio:", error);
    throw new Error("No se pudo actualizar el servicio");
  }

  return data as Servicio;
};

export const eliminarServicio = async (id: number): Promise<void> => {
  const { error } = await supabase.from("servicios").delete().eq("id", id);

  if (error) {
    console.error("Error al eliminar servicio:", error);
    throw new Error("No se pudo eliminar el servicio");
  }
};
