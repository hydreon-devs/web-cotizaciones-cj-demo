import { useEffect, useRef, useState } from "react";
import { Loader2, Pencil, Trash2, Plus, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Servicio } from "@/types/cotizacion";
import {
  obtenerServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
} from "@/services/serviciosService";
import { eliminarProductosPorServicio } from "@/services/productosService";
import { toast } from "sonner";

const estadosDisponibles = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
];

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-CO").format(date);
};

const EstadoBadge = ({ estado }: { estado: string | null }) => {
  if (estado === "activo") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
        Activo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
      {estado ?? "—"}
    </span>
  );
};

const Servicios = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState("activo");

  const scrollTopRef = useRef<HTMLDivElement>(null);
  const scrollTableRef = useRef<HTMLDivElement>(null);

  const [dialogEditarAbierto, setDialogEditarAbierto] = useState(false);
  const [servicioEditando, setServicioEditando] = useState<Servicio | null>(null);

  const [dialogEliminarAbierto, setDialogEliminarAbierto] = useState(false);
  const [servicioAEliminar, setServicioAEliminar] = useState<Servicio | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [nombreEditar, setNombreEditar] = useState("");
  const [descripcionEditar, setDescripcionEditar] = useState("");
  const [estadoEditar, setEstadoEditar] = useState("activo");

  const cargarServicios = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerServicios();
      setServicios(data);
    } catch (errorCarga) {
      console.error(errorCarga);
      setError("No se pudieron cargar los servicios");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  useEffect(() => {
    const top = scrollTopRef.current;
    const table = scrollTableRef.current;
    if (!top || !table) return;
    const syncFromTop = () => { table.scrollLeft = top.scrollLeft; };
    const syncFromTable = () => { top.scrollLeft = table.scrollLeft; };
    top.addEventListener("scroll", syncFromTop);
    table.addEventListener("scroll", syncFromTable);
    return () => {
      top.removeEventListener("scroll", syncFromTop);
      table.removeEventListener("scroll", syncFromTable);
    };
  }, []);

  const limpiarFormulario = () => {
    setNombre("");
    setDescripcion("");
    setEstado("activo");
  };

  const handleCrearServicio = async () => {
    if (!nombre.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    try {
      await crearServicio({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        estado,
      });
      toast.success("Servicio creado correctamente");
      limpiarFormulario();
      await cargarServicios();
    } catch (errorCrear) {
      const mensaje =
        errorCrear instanceof Error ? errorCrear.message : "No se pudo crear el servicio";
      toast.error(mensaje);
    }
  };

  const handleAbrirEditar = (servicio: Servicio) => {
    setServicioEditando(servicio);
    setNombreEditar(servicio.nombre ?? "");
    setDescripcionEditar(servicio.descripcion ?? "");
    setEstadoEditar(servicio.estado ?? "activo");
    setDialogEditarAbierto(true);
  };

  const handleGuardarEdicion = async () => {
    if (!servicioEditando) return;
    if (!nombreEditar.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    try {
      await actualizarServicio(servicioEditando.id, {
        nombre: nombreEditar.trim(),
        descripcion: descripcionEditar.trim() || null,
        estado: estadoEditar,
      });
      toast.success("Servicio actualizado correctamente");
      setDialogEditarAbierto(false);
      await cargarServicios();
    } catch {
      toast.error("No se pudo actualizar el servicio");
    }
  };

  const handleClickEliminar = (servicio: Servicio) => {
    setServicioAEliminar(servicio);
    setDialogEliminarAbierto(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!servicioAEliminar) return;

    try {
      setEliminando(true);
      await eliminarProductosPorServicio(servicioAEliminar.id);
      await eliminarServicio(servicioAEliminar.id);
      setDialogEliminarAbierto(false);
      setServicios((prev) => prev.filter((s) => s.id !== servicioAEliminar.id));
      setServicioAEliminar(null);
      toast.success("Servicio eliminado correctamente");
    } catch {
      toast.error("No se pudo eliminar el servicio");
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Page header ───────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Servicios
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administrá el catálogo de servicios disponibles para las cotizaciones
        </p>
      </div>

      {/* ── Stat line ─────────────────────────────────────────────── */}
      {!cargando && servicios.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <Briefcase className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {servicios.length}
          </span>
        </div>
      )}

      {/* ── Two-column layout ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* ── Create form ─────────────────────────────────────────── */}
        <div className="md:col-span-1 rounded-xl border bg-card overflow-hidden">
          <div className="h-0.5 w-full bg-primary" />
          <div className="p-5 space-y-4">
            <p className="text-sm font-medium text-foreground">Nuevo servicio</p>

            <div className="space-y-1.5">
              <Label htmlFor="nombre-servicio" className="text-xs text-muted-foreground">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nombre-servicio"
                className="h-9"
                placeholder="Ej: Servicio de catering"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descripcion-servicio" className="text-xs text-muted-foreground">
                Descripción
              </Label>
              <Textarea
                id="descripcion-servicio"
                placeholder="Describe el servicio"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Estado</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadosDisponibles.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full gap-2" onClick={handleCrearServicio}>
              <Plus className="h-4 w-4" />
              Crear servicio
            </Button>
          </div>
        </div>

        {/* ── Table panel ─────────────────────────────────────────── */}
        <div className="md:col-span-2 rounded-xl border bg-card overflow-hidden">
          {/* Mirror horizontal scrollbar — top */}
          <div
            ref={scrollTopRef}
            className="overflow-x-auto overflow-y-hidden border-b border-border"
            style={{ height: 13 }}
          >
            <div style={{ minWidth: 560, height: 1 }} />
          </div>
          <div ref={scrollTableRef} className="overflow-auto max-h-[calc(100vh-293px)]">
            <Table className="min-w-[560px]">
              <TableHeader className="sticky top-0 z-10">
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="pl-4 text-xs uppercase tracking-wider text-muted-foreground font-medium bg-card">
                    Nombre
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium bg-card">
                    Descripción
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium bg-card">
                    Estado
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium bg-card">
                    Creado
                  </TableHead>
                  <TableHead className="w-16 bg-card" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {cargando ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cargando servicios…
                      </span>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-sm text-destructive">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : servicios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-sm text-muted-foreground">
                      No hay servicios registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  servicios.map((servicio, index) => (
                    <TableRow
                      key={servicio.id}
                      className="group border-b last:border-0 hover:bg-muted/40 transition-colors duration-150 animate-fade-in opacity-0"
                      style={{
                        animationDelay: `${index * 40}ms`,
                        animationFillMode: "forwards",
                      }}
                    >
                      <TableCell className="pl-4">
                        <span className="text-sm font-medium text-foreground">
                          {servicio.nombre ?? "Sin nombre"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                          {servicio.descripcion || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <EstadoBadge estado={servicio.estado} />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm tabular-nums text-muted-foreground">
                          {formatDate(servicio.created_at)}
                        </span>
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => handleAbrirEditar(servicio)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleClickEliminar(servicio)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* ── Delete dialog ─────────────────────────────────────────── */}
      <Dialog open={dialogEliminarAbierto} onOpenChange={setDialogEliminarAbierto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Servicio</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar el servicio{" "}
              <span className="font-semibold text-foreground">
                {servicioAEliminar?.nombre ?? "sin nombre"}
              </span>
              ? Esta acción eliminará también todos los productos asociados y no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDialogEliminarAbierto(false)}
              disabled={eliminando}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmarEliminar} disabled={eliminando}>
              {eliminando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando…
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit dialog ───────────────────────────────────────────── */}
      <Dialog open={dialogEditarAbierto} onOpenChange={setDialogEditarAbierto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar servicio</DialogTitle>
            <DialogDescription>
              Actualizá la información del servicio seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre-editar">Nombre</Label>
              <Input
                id="nombre-editar"
                value={nombreEditar}
                onChange={(e) => setNombreEditar(e.target.value)}
                placeholder="Nombre del servicio"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion-editar">Descripción</Label>
              <Textarea
                id="descripcion-editar"
                value={descripcionEditar}
                onChange={(e) => setDescripcionEditar(e.target.value)}
                placeholder="Descripción del servicio"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={estadoEditar} onValueChange={setEstadoEditar}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadosDisponibles.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEditarAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarEdicion}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Servicios;
