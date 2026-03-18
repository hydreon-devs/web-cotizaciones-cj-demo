import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Building2,
  Heart,
  Presentation,
  PartyPopper,
  Rocket,
  FileText,
  Check,
  Trash2,
  Edit,
  User,
  Loader2,
  Plus,
  ArrowRight,
  LayoutTemplate,
} from "lucide-react";
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
import { PlantillaCotizacion } from "@/types/cotizacion";
import { PlantillasService } from "@/services/plantillasService";
import { toast } from "sonner";
import { CotizacionesService } from "@/services/cotizacionesService";

/* ─── Icon map ──────────────────────────────────────────────────── */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Heart,
  Presentation,
  PartyPopper,
  Rocket,
  FileText,
};

const Plantillas = () => {
  const navigate = useNavigate();
  const [plantillas, setPlantillas] = useState<PlantillaCotizacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [dialogEditarAbierto, setDialogEditarAbierto] = useState(false);
  const [plantillaEditando, setPlantillaEditando] = useState<PlantillaCotizacion | null>(null);
  const [nombreEditar, setNombreEditar] = useState("");
  const [descripcionEditar, setDescripcionEditar] = useState("");
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [dialogEliminarAbierto, setDialogEliminarAbierto] = useState(false);
  const [plantillaAEliminar, setPlantillaAEliminar] = useState<PlantillaCotizacion | null>(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    cargarPlantillas();
  }, []);

  const cargarPlantillas = async () => {
    try {
      setCargando(true);
      const plantillasGuardadas = await PlantillasService.obtenerTodas();
      setPlantillas(plantillasGuardadas);
    } catch (error) {
      toast.error("Error al cargar las plantillas");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };
  const handleClickEliminar = (plantilla: PlantillaCotizacion, e: React.MouseEvent) => {
   e.stopPropagation();
   setPlantillaAEliminar(plantilla);
   setDialogEliminarAbierto(true);
 };

 const handleConfirmarEliminar = async () => {
   if (!plantillaAEliminar) return;

   try {
     setEliminando(true);
     await PlantillasService.eliminar(plantillaAEliminar.id);

     setDialogEliminarAbierto(false);
     setEliminandoId(plantillaAEliminar.id);

     setTimeout(() => {
       setPlantillas((prev) => prev.filter((c) => c.id !== plantillaAEliminar.id));
       setPlantillaAEliminar(null);
       setEliminandoId(null);
       toast.success("Plantilla eliminada correctamente");
     }, 300);
   } catch (error) {
     toast.error("Error al eliminar la plantilla");
     console.error(error);
   } finally {
     setEliminando(false);
   }
 };

 const handleCancelarEliminar = () => {
   setDialogEliminarAbierto(false);
   setPlantillaAEliminar(null);
 };


  const handleSeleccionarPlantilla = (plantilla: PlantillaCotizacion) => {
    navigate("/nueva", { state: { plantilla: plantilla.datos } });
  };

  const handleAbrirEditar = (plantilla: PlantillaCotizacion, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlantillaEditando(plantilla);
    setNombreEditar(plantilla.nombre);
    setDescripcionEditar(plantilla.descripcion);
    setDialogEditarAbierto(true);
  };

  const handleGuardarEdicion = async () => {
    if (!plantillaEditando) return;

    if (!nombreEditar.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    try {
      await PlantillasService.actualizar(plantillaEditando.id, {
        nombre: nombreEditar,
        descripcion: descripcionEditar,
      });

      await cargarPlantillas();
      setDialogEditarAbierto(false);
      toast.success("Plantilla actualizada correctamente");
    } catch (error) {
      toast.error("Error al actualizar la plantilla");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calcularTotal = (plantilla: PlantillaCotizacion) => {
    return plantilla.datos.productos.reduce(
      (acc, p) => acc + p.cantidad * p.precioUnitario,
      0
    );
  };

  return (
    <div className="space-y-6">

      {/* ── Page header ───────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Plantillas de Cotización
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Seleccioná una plantilla para comenzar rápidamente
          </p>
        </div>
        <Button
          className="shrink-0 gap-2"
          onClick={() => navigate("/nueva")}
        >
          <Plus className="h-4 w-4" />
          Nueva Cotización
        </Button>
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      {cargando ? (
        <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando plantillas…</p>
        </div>

      ) : plantillas.length === 0 ? (
        /* ── Empty state ──────────────────────────────────────────── */
        <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-24 gap-5 text-center animate-fade-in">
          <div
            className="h-20 w-20 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "hsl(217 91% 60% / 0.08)" }}
          >
            <LayoutTemplate className="h-9 w-9 text-primary" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              No hay plantillas guardadas
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Creá una cotización y guardala como plantilla para reutilizarla
            </p>
          </div>
          <Button onClick={() => navigate("/nueva")} className="gap-2 mt-1">
            <Plus className="h-4 w-4" />
            Crear Nueva Cotización
          </Button>
        </div>

      ) : (
        <>
          {/* ── Stat horizontal ─────────────────────────────────── */}
          <div className="flex items-center gap-2 px-1">
            <LayoutTemplate className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {plantillas.length}
            </span>
          </div>

          {/* ── Grid ────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plantillas.map((plantilla, index) => {
              const Icon = iconMap[plantilla.icono] ?? FileText;
              const total = calcularTotal(plantilla);
              const isEliminating = eliminandoId === plantilla.id;

              return (
                <div
                  key={plantilla.id}
                  onClick={() => handleSeleccionarPlantilla(plantilla)}
                  className={`
                    group relative rounded-xl border bg-card overflow-hidden
                    cursor-pointer
                    transition-all duration-200
                    hover:shadow-md hover:shadow-primary/8 hover:border-primary/40 hover:-translate-y-0.5
                    animate-scale-in opacity-0
                    ${isEliminating ? "animate-slide-out-right !opacity-100" : ""}
                  `}
                  style={{
                    animationDelay: `${index * 60}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  {/* Top accent line */}
                  <div className="h-0.5 w-full bg-border group-hover:bg-primary transition-colors duration-200" />

                  <div className="p-5 space-y-4">

                    {/* ── Card header ─────────────────────────── */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:bg-primary/15">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-foreground leading-snug truncate">
                            {plantilla.nombre}
                          </h3>
                          {plantilla.descripcion && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {plantilla.descripcion}
                            </p>
                          )}
                        </div>
                      </div>

                      {plantilla.datos.descuento > 0 && (
                        <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          -{plantilla.datos.descuento}%
                        </span>
                      )}
                    </div>

                    {/* ── Products list ───────────────────────── */}
                    {plantilla.datos.productos.length > 0 ? (
                      <div className="space-y-2">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                          Incluye
                        </span>
                        <ul className="space-y-1.5">
                          {plantilla.datos.productos.slice(0, 3).map((producto, idx) => (
                            <li
                              key={producto.id}
                              className="flex items-center gap-2 text-xs text-foreground transition-transform duration-150 group-hover:translate-x-0.5"
                              style={{ transitionDelay: `${idx * 30}ms` }}
                            >
                              <Check className="h-3 w-3 text-primary shrink-0" />
                              <span className="truncate">{producto.descripcion}</span>
                            </li>
                          ))}
                          {plantilla.datos.productos.length > 3 && (
                            <li className="text-xs text-muted-foreground pl-5">
                              +{plantilla.datos.productos.length - 3} más
                            </li>
                          )}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Comienza con una cotización vacía
                      </p>
                    )}

                    {/* ── Footer ──────────────────────────────── */}
                    <div className="pt-3 border-t border-border space-y-2.5">
                      <div className="flex items-center justify-between">
                        {total > 0 ? (
                          <span className="text-sm font-semibold text-primary tabular-nums">
                            {formatCurrency(total)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sin precio base</span>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3 shrink-0" />
                          <span className="truncate max-w-[100px]">{plantilla.autor}</span>
                        </div>
                      </div>

                      {/* Actions row */}
                      <div className="flex items-center justify-between gap-2">
                        {/* Usar plantilla hint */}
                        <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          Usar plantilla
                          <ArrowRight className="h-3 w-3" />
                        </span>

                        {/* Edit / Delete */}
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            onClick={(e) => handleAbrirEditar(plantilla, e)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            onClick={(e) => handleClickEliminar(plantilla, e)}
                            disabled={isEliminating}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Edit dialog ──────────────────────────────────────────── */}
      <Dialog open={dialogEditarAbierto} onOpenChange={setDialogEditarAbierto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Plantilla</DialogTitle>
            <DialogDescription>
              Modificá los detalles de la plantilla.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre-editar">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nombre-editar"
                value={nombreEditar}
                onChange={(e) => setNombreEditar(e.target.value)}
                placeholder="Nombre de la plantilla"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion-editar">Descripción</Label>
              <Textarea
                id="descripcion-editar"
                value={descripcionEditar}
                onChange={(e) => setDescripcionEditar(e.target.value)}
                placeholder="Descripción de la plantilla"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEditarAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarEdicion}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete dialog ───────────────────────────────────────── */}
      <Dialog open={dialogEliminarAbierto} onOpenChange={setDialogEliminarAbierto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Plantilla</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar la plantilla{" "}
              <span className="font-semibold text-foreground">
                {plantillaAEliminar?.nombre}
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
    </div>
  );
};

export default Plantillas;
