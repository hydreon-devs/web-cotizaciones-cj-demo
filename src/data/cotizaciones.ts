import { Cotizacion } from "@/types/cotizacion";

export const cotizacionesMock: Cotizacion[] = [
  {
    id: "1",
    numero: "COT-2023-0426",
    cliente: "Grupo Empresarial XYZ",
    fecha: "15/11/2023",
    montoTotal: 24850.0,
    estado: "aprobada",
  },
  {
    id: "2",
    numero: "COT-2023-0425",
    cliente: "Constructora Edificar S.A.",
    fecha: "14/11/2023",
    montoTotal: 18320.5,
    estado: "pendiente",
  },
  {
    id: "3",
    numero: "COT-2023-0424",
    cliente: "Comercial Monterrey",
    fecha: "10/11/2023",
    montoTotal: 9675.25,
    estado: "rechazada",
  },
  {
    id: "4",
    numero: "COT-2023-0423",
    cliente: "Industrias Pacífico",
    fecha: "08/11/2023",
    montoTotal: 32150.75,
    estado: "aprobada",
  },
  {
    id: "5",
    numero: "COT-2023-0422",
    cliente: "Grupo Empresarial XYZ",
    fecha: "05/11/2023",
    montoTotal: 15780.0,
    estado: "expirada",
  },
  {
    id: "6",
    numero: "COT-2023-0421",
    cliente: "Tech Solutions S.A.",
    fecha: "01/11/2023",
    montoTotal: 45000.0,
    estado: "aprobada",
  },
  {
    id: "7",
    numero: "COT-2023-0420",
    cliente: "Distribuidora Norte",
    fecha: "28/10/2023",
    montoTotal: 12500.0,
    estado: "pendiente",
  },
];

export const serviciosMock = [
  { id: "1", nombre: "Desarrollo de sitio web corporativo", precio: 1500000 },
  { id: "2", nombre: "Mantenimiento mensual", precio: 120000 },
  { id: "3", nombre: "Hosting Premium (anual)", precio: 350000 },
  { id: "4", nombre: "Capacitación de personal", precio: 80000 },
  { id: "5", nombre: "Diseño de logo", precio: 250000 },
  { id: "6", nombre: "Marketing digital mensual", precio: 180000 },
  { id: "7", nombre: "SEO y posicionamiento", precio: 200000 },
];
