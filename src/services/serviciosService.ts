import { Servicio } from "@/types/cotizacion";
import { serviciosStore, generateNumericId } from "@/demo/demoStore";

type ServicioInput = {
  nombre: string;
  descripcion?: string | null;
  estado?: string | null;
};

export const obtenerServicios = async (): Promise<Servicio[]> => {
  return [...serviciosStore].sort((a, b) =>
    (a.nombre ?? "").localeCompare(b.nombre ?? "")
  );
};

export const crearServicio = async (payload: ServicioInput): Promise<Servicio> => {
  const now = new Date().toISOString();
  const nuevo: Servicio = {
    id: generateNumericId(),
    nombre: payload.nombre,
    descripcion: payload.descripcion ?? null,
    estado: payload.estado ?? "activo",
    created_at: now,
    updated_at: now,
  };
  serviciosStore.push(nuevo);
  return { ...nuevo };
};

export const actualizarServicio = async (
  id: number,
  payload: ServicioInput
): Promise<Servicio> => {
  const index = serviciosStore.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error("No se pudo actualizar el servicio");
  }
  const now = new Date().toISOString();
  serviciosStore[index] = {
    ...serviciosStore[index],
    nombre: payload.nombre,
    descripcion: payload.descripcion ?? null,
    estado: payload.estado ?? null,
    updated_at: now,
  };
  return { ...serviciosStore[index] };
};

export const eliminarServicio = async (id: number): Promise<void> => {
  const index = serviciosStore.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error("No se pudo eliminar el servicio");
  }
  serviciosStore.splice(index, 1);
};
