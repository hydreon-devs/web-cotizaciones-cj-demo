import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CotizacionesService } from "@/services/cotizacionesService";
import { Cotizacion, DatosCotizacion } from "@/types/cotizacion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Loader2,
  FileText,
  Trash2,
  AlertCircle,
  Plus,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Copy,
  ArrowLeft,
} from "lucide-react";
import { roles } from "@/utils/const";

const CotizacionesLista = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [clientes, setClientes] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [clienteFilter, setClienteFilter] = useState<string>("todos");
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogEliminarAbierto, setDialogEliminarAbierto] = useState(false);
  const [cotizacionAEliminar, setCotizacionAEliminar] = useState<Cotizacion | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [dialogDetalleAbierto, setDialogDetalleAbierto] = useState(false);
  const [cotizacionDetalle, setCotizacionDetalle] = useState<Cotizacion | null>(null);
  const [datosCotizacionDetalle, setDatosCotizacionDetalle] = useState<DatosCotizacion | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const itemsPerPage = 10;
  const esAdmin = user?.role === roles.ADMIN;
  const rangoFechaInvalido = !!fechaDesde && !!fechaHasta && fechaDesde > fechaHasta;

  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      try {
        setCargando(true);
        const [cotizacionesData, clientesData] = await Promise.all([
          CotizacionesService.obtenerTodas(),
          CotizacionesService.obtenerClientes(),
        ]);
        if (!activo) return;
        setCotizaciones(cotizacionesData);
        setClientes(clientesData);
      } catch (error) {
        if (!activo) return;
        toast.error("Error al cargar las cotizaciones");
        console.error(error);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  const parseFechaCotizacion = (fechaStr: string): Date | null => {
    if (!fechaStr) return null;
    const parts = fechaStr.split(/[/-]/);
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month - 1, day);
  };

  const parseFechaInput = (fechaStr: string): Date | null => {
    if (!fechaStr) return null;
    const parts = fechaStr.split("-");
    if (parts.length !== 3) return null;
    const [year, month, day] = parts.map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month - 1, day);
  };

  const filteredData = useMemo(() => {
    return cotizaciones.filter((cot) => {
      if (clienteFilter !== "todos" && cot.cliente !== clienteFilter) return false;

      const cotFecha = parseFechaCotizacion(cot.fecha);
      if (cotFecha) {
        if (fechaDesde) {
          const desde = parseFechaInput(fechaDesde);
          if (desde && cotFecha < desde) return false;
        }
        if (fechaHasta) {
          const hasta = parseFechaInput(fechaHasta);
          if (hasta) {
            hasta.setHours(23, 59, 59, 999);
            if (cotFecha > hasta) return false;
          }
        }
      }

      return true;
    });
  }, [cotizaciones, clienteFilter, fechaDesde, fechaHasta]);

  useEffect(() => {
    setCurrentPage(1);
  }, [clienteFilter, fechaDesde, fechaHasta]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleLimpiarFiltros = () => {
    setClienteFilter("todos");
    setFechaDesde("");
    setFechaHasta("");
    setCurrentPage(1);
  };

  const hayFiltrosActivos =
    clienteFilter !== "todos" ||
    !!fechaDesde ||
    !!fechaHasta;

  const handleSeleccionarCotizacion = async (cotizacion: Cotizacion) => {
    setCotizacionDetalle(cotizacion);
    setDatosCotizacionDetalle(null);
    setDialogDetalleAbierto(true);
    try {
      setCargandoDetalle(true);
      const datos = await CotizacionesService.obtenerPorId(Number(cotizacion.id));
      if (datos) {
        setDatosCotizacionDetalle(datos);
      } else {
        toast.error("No se pudo cargar la cotización");
        setDialogDetalleAbierto(false);
      }
    } catch (error) {
      toast.error("Error al cargar la cotización");
      console.error(error);
      setDialogDetalleAbierto(false);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const handleCrearDesdeCotizacion = () => {
    if (!datosCotizacionDetalle) return;
    setDialogDetalleAbierto(false);
    navigate("/nueva", { state: { plantilla: datosCotizacionDetalle } });
  };

  const handleClickEliminar = (cotizacion: Cotizacion, e: React.MouseEvent) => {
    e.stopPropagation();
    setCotizacionAEliminar(cotizacion);
    setDialogEliminarAbierto(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!cotizacionAEliminar) return;

    try {
      setEliminando(true);
      await CotizacionesService.eliminar(Number(cotizacionAEliminar.id));

      setDialogEliminarAbierto(false);
      setEliminandoId(cotizacionAEliminar.id);

      setTimeout(() => {
        setCotizaciones((prev) => prev.filter((c) => c.id !== cotizacionAEliminar.id));
        setCotizacionAEliminar(null);
        setEliminandoId(null);
        toast.success("Cotización eliminada correctamente");
      }, 300);
    } catch (error) {
      toast.error("Error al eliminar la cotización");
      console.error(error);
    } finally {
      setEliminando(false);
    }
  };

  const handleCancelarEliminar = () => {
    setDialogEliminarAbierto(false);
    setCotizacionAEliminar(null);
  };

  return (
    <>
      <div className="space-y-6">

        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Historial de Cotizaciones
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Consultá y gestioná todas las cotizaciones guardadas
            </p>
          </div>
          <Link to="/nueva">
            <Button className="shrink-0 gap-2">
              <Plus className="h-4 w-4" />
              Nueva Cotización
            </Button>
          </Link>
        </div>

        {/* ── Filters ─────────────────────────────────────────────── */}
        <div className="rounded-xl border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            Filtros
            {hayFiltrosActivos && (
              <span className="ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLimpiarFiltros}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpiar filtros
                </Button>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Cliente */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Cliente</label>
              <Select value={clienteFilter} onValueChange={setClienteFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos los clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los clientes</SelectItem>
                  {clientes.length === 0 ? (
                    <SelectItem value="sin-clientes" disabled>
                      No hay clientes disponibles
                    </SelectItem>
                  ) : (
                    clientes.map((cliente) => (
                      <SelectItem key={cliente} value={cliente}>
                        {cliente}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha desde */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Fecha desde</label>
              <Input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className={`h-9 ${rangoFechaInvalido ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
            </div>

            {/* Fecha hasta */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Fecha hasta</label>
              <Input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className={`h-9 ${rangoFechaInvalido ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {rangoFechaInvalido && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  La fecha hasta debe ser mayor a la fecha desde
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Main content ────────────────────────────────────────── */}
        {cargando ? (
          <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Cargando cotizaciones…</p>
          </div>
        ) : cotizaciones.length === 0 ? (
          /* ── Empty state ──────────────────────────────────────── */
          <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-24 gap-5 text-center animate-fade-in">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-9 w-9 text-primary" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">
                No hay cotizaciones todavía
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                Creá tu primera cotización y aparecerá acá con todos sus detalles
              </p>
            </div>
            <Button onClick={() => navigate("/nueva")} className="gap-2 mt-1">
              <Plus className="h-4 w-4" />
              Crear primera cotización
            </Button>
          </div>
        ) : (
          /* ── Table ────────────────────────────────────────────── */
          <>
            {/* Stat horizontal */}
            <div className="flex items-center gap-2 px-1">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {cotizaciones.length}
              </span>
              {hayFiltrosActivos && (
                <span className="text-xs text-muted-foreground">
                  ({filteredData.length} filtradas)
                </span>
              )}
            </div>

            <div className="rounded-xl border bg-card overflow-hidden">

            <div className="overflow-x-auto">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="w-[140px] pl-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                      N° Cotización
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                      Cliente
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                      Fecha
                    </TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground font-medium">
                      Monto Total
                    </TableHead>
                    {esAdmin && (
                      <TableHead className="text-center w-14 text-xs uppercase tracking-wider text-muted-foreground font-medium" />
                    )}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={esAdmin ? 5 : 4}
                        className="h-32 text-center text-sm text-muted-foreground"
                      >
                        Ninguna cotización coincide con los filtros aplicados
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((cotizacion, index) => (
                      <TableRow
                        key={cotizacion.id}
                        onClick={() => handleSeleccionarCotizacion(cotizacion)}
                        className={`
                          group cursor-pointer border-b last:border-0
                          transition-colors duration-150
                          hover:bg-muted/40
                          animate-fade-in opacity-0
                          ${eliminandoId === cotizacion.id ? "animate-slide-out-right !opacity-100" : ""}
                        `}
                        style={{
                          animationDelay:
                            eliminandoId === cotizacion.id ? "0ms" : `${index * 40}ms`,
                          animationFillMode: "forwards",
                        }}
                      >
                        {/* Left accent bar */}
                        <TableCell className="pl-0 pr-4 w-[140px]">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-1 rounded-full shrink-0 bg-primary transition-all duration-200 group-hover:h-10" />
                            <span className="font-mono text-sm font-semibold text-primary">
                              {cotizacion.numero}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm font-medium text-foreground">
                            {cotizacion.cliente}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm tabular-nums text-muted-foreground">
                            {cotizacion.fecha}
                          </span>
                        </TableCell>

                        <TableCell className="text-right">
                          <span className="text-sm font-semibold tabular-nums text-foreground">
                            {formatCurrency(cotizacion.montoTotal)}
                          </span>
                        </TableCell>

                        {esAdmin && (
                          <TableCell className="text-center pr-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors duration-150"
                              onClick={(e) => handleClickEliminar(cotizacion, e)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* ── Pagination ──────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t bg-muted/20">
                <span className="text-xs text-muted-foreground order-2 sm:order-1">
                  Mostrando{" "}
                  <span className="font-medium text-foreground">
                    {(currentPage - 1) * itemsPerPage + 1}–
                    {Math.min(currentPage * itemsPerPage, filteredData.length)}
                  </span>{" "}
                  de{" "}
                  <span className="font-medium text-foreground">{filteredData.length}</span>{" "}
                  resultados
                </span>

                <div className="flex items-center gap-1 order-1 sm:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Mobile */}
                  <span className="sm:hidden px-3 py-1 text-sm text-muted-foreground">
                    {currentPage} / {totalPages}
                  </span>

                  {/* Desktop page numbers */}
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        if (totalPages <= 5) return true;
                        if (page === 1 || page === totalPages) return true;
                        if (Math.abs(page - currentPage) <= 1) return true;
                        return false;
                      })
                      .map((page, idx, arr) => (
                        <span key={page} className="flex items-center">
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span className="px-1.5 text-muted-foreground text-sm select-none">
                              …
                            </span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "ghost"}
                            size="sm"
                            className="h-8 w-8 p-0 text-sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        </span>
                      ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          </>
        )}
      </div>

      {/* ── Detail dialog ───────────────────────────────────────── */}
      <Dialog open={dialogDetalleAbierto} onOpenChange={setDialogDetalleAbierto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <span className="font-mono text-primary">{cotizacionDetalle?.numero}</span>
              <span className="text-muted-foreground font-normal">—</span>
              <span className="truncate">{cotizacionDetalle?.cliente}</span>
            </DialogTitle>
            <DialogDescription>
              Detalle de la cotización en modo solo lectura
            </DialogDescription>
          </DialogHeader>

          {cargandoDetalle ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : datosCotizacionDetalle ? (
            <div className="space-y-5 py-2">
              {/* Info general */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-lg border bg-muted/30 p-4 text-sm">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Fecha</p>
                  <p className="font-medium">{cotizacionDetalle?.fecha || "—"}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Evento</p>
                  <p className="font-medium">{datosCotizacionDetalle.evento || "—"}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
                  <p className="font-semibold text-primary">{formatCurrency(cotizacionDetalle?.montoTotal ?? 0)}</p>
                </div>
                {datosCotizacionDetalle.descuento > 0 && (
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Descuento</p>
                    <p className="font-medium">{datosCotizacionDetalle.descuento}%</p>
                  </div>
                )}
              </div>

              {/* Productos agrupados por servicio */}
              {(() => {
                const grupos = datosCotizacionDetalle.productos.reduce<Record<string, typeof datosCotizacionDetalle.productos>>(
                  (acc, p) => {
                    const key = p.nombreServicio?.trim() || "Sin servicio";
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(p);
                    return acc;
                  },
                  {}
                );
                const gruposEntries = Object.entries(grupos);

                return (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Productos / Servicios ({datosCotizacionDetalle.productos.length})
                    </h3>
                    {gruposEntries.map(([servicio, productos]) => (
                      <div key={servicio} className="rounded-lg border overflow-hidden">
                        <div className="px-3 py-2 bg-muted/50 border-b">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {servicio}
                          </span>
                        </div>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/20">
                              <th className="px-3 py-2 text-left text-xs text-muted-foreground font-medium uppercase tracking-wide">Descripción</th>
                              <th className="px-3 py-2 text-center text-xs text-muted-foreground font-medium uppercase tracking-wide w-16">Cant.</th>
                              <th className="px-3 py-2 text-right text-xs text-muted-foreground font-medium uppercase tracking-wide">Precio unit.</th>
                              <th className="px-3 py-2 text-right text-xs text-muted-foreground font-medium uppercase tracking-wide">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productos.map((p, i) => (
                              <tr key={i} className="border-b last:border-0">
                                <td className="px-3 py-2 text-foreground">{p.descripcion}</td>
                                <td className="px-3 py-2 text-center tabular-nums text-muted-foreground">{p.cantidad}</td>
                                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{formatCurrency(p.precioUnitario)}</td>
                                <td className="px-3 py-2 text-right tabular-nums font-medium">{formatCurrency(p.cantidad * p.precioUnitario)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Consideraciones */}
              {datosCotizacionDetalle.consideraciones && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">Consideraciones</h3>
                  <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground whitespace-pre-wrap">
                    {datosCotizacionDetalle.consideraciones}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDialogDetalleAbierto(false)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <Button
              onClick={handleCrearDesdeCotizacion}
              disabled={!datosCotizacionDetalle || cargandoDetalle}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Crear cotización a partir de esta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete dialog ───────────────────────────────────────── */}
      <Dialog open={dialogEliminarAbierto} onOpenChange={setDialogEliminarAbierto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Cotización</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar la cotización del cliente{" "}
              <span className="font-semibold text-foreground">
                {cotizacionAEliminar?.cliente}
              </span>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancelarEliminar}
              disabled={eliminando}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmarEliminar}
              disabled={eliminando}
            >
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
    </>
  );
};

export default CotizacionesLista;
