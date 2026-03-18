/**
 * Store en memoria para el modo demo.
 * Todos los servicios operan sobre estos arrays mutables.
 * El estado se pierde al recargar la página (excepto la sesión en localStorage).
 */

import {
  DEMO_SERVICIOS,
  DEMO_PRODUCTOS,
  DEMO_COTIZACIONES,
  DEMO_PLANTILLAS,
  type DemoCotizacionDB,
} from "./demoData";
import type { Servicio, ProductoServicio, PlantillaDB } from "@/types/cotizacion";

// ==========================================
// CONTADORES para IDs autoincrementales
// ==========================================

let _servicioIdCounter = 100;
let _productoIdCounter = 100;
let _cotizacionIdCounter = 10;
let _consideracionIdCounter = 100;

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const generateNumericId = (): number => {
  return ++_servicioIdCounter;
};

export const generateProductoId = (): number => {
  return ++_productoIdCounter;
};

export const generateCotizacionId = (): number => {
  return ++_cotizacionIdCounter;
};

export const generateConsideracionId = (): number => {
  return ++_consideracionIdCounter;
};

// ==========================================
// STORES MUTABLES
// Clonamos los datos iniciales para que sean mutables
// ==========================================

export const serviciosStore: Servicio[] = DEMO_SERVICIOS.map((s) => ({ ...s }));

export const productosStore: ProductoServicio[] = DEMO_PRODUCTOS.map((p) => ({ ...p }));

export const cotizacionesStore: DemoCotizacionDB[] = DEMO_COTIZACIONES.map((c) => ({
  ...c,
  cuerpo: c.cuerpo.map((item) => ({ ...item })),
  consideraciones: c.consideraciones.map((cons) => ({ ...cons })),
}));

export const plantillasStore: PlantillaDB[] = DEMO_PLANTILLAS.map((p) => ({
  ...p,
  servicios: (p.servicios ?? []).map((s) => ({
    ...s,
    productos: (s.productos ?? []).map((prod) => ({ ...prod })),
  })),
}));
