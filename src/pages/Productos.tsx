import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Trash2, Plus, Package } from "lucide-react";
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
import { ProductoServicio, Servicio } from "@/types/cotizacion";
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "@/services/productosService";
import { obtenerServicios } from "@/services/serviciosService";
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

const formatCurrency = (amount: number | null) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount ?? 0);
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

const Productos = () => {
  const [productos, setProductos] = useState<ProductoServicio[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [idServicio, setIdServicio] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [estado, setEstado] = useState("activo");

  const [dialogEditarAbierto, setDialogEditarAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<ProductoServicio | null>(null);

  const [dialogEliminarAbierto, setDialogEliminarAbierto] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState<ProductoServicio | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [idServicioEditar, setIdServicioEditar] = useState("");
  const [nombreEditar, setNombreEditar] = useState("");
  const [descripcionEditar, setDescripcionEditar] = useState("");
  const [precioEditar, setPrecioEditar] = useState("");
  const [estadoEditar, setEstadoEditar] = useState("activo");

  const serviciosMap = useMemo(() => {
    return new Map(servicios.map((s) => [s.id, s.nombre ?? ""]));
  }, [servicios]);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const [dataServicios, dataProductos] = await Promise.all([
        obtenerServicios(),
        obtenerProductos(),
      ]);
      setServicios(dataServicios);
      setProductos(dataProductos);
    } catch (errorCarga) {
      console.error(errorCarga);
      setError("No se pudieron cargar los productos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);


  const limpiarFormulario = () => {
    setIdServicio("");
    setNombre("");
    setDescripcion("");
    setPrecio("");
    setEstado("activo");
  };

  const parsePrecio = (value: string) => {
    if (!value.trim()) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const handleCrear = async () => {
    if (!idServicio) {
      toast.error("Seleccioná un servicio");
      return;
    }
    if (!nombre.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    const precioValue = parsePrecio(precio);
    if (precio.trim() && precioValue === null) {
      toast.error("Precio inválido");
      return;
    }

    try {
      await crearProducto({
        id_servicio: Number(idServicio),
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        precio: precioValue,
        estado,
      });
      toast.success("Producto creado correctamente");
      limpiarFormulario();
      await cargarDatos();
    } catch (errorCrear) {
      const mensaje =
        errorCrear instanceof Error ? errorCrear.message : "No se pudo crear el producto";
      toast.error(mensaje);
    }
  };

  const handleAbrirEditar = (producto: ProductoServicio) => {
    setProductoEditando(producto);
    setIdServicioEditar(String(producto.id_servicio));
    setNombreEditar(producto.nombre ?? "");
    setDescripcionEditar(producto.descripcion ?? "");
    setPrecioEditar(producto.precio !== null ? String(producto.precio) : "");
    setEstadoEditar(producto.estado ?? "activo");
    setDialogEditarAbierto(true);
  };

  const handleGuardarEdicion = async () => {
    if (!productoEditando) return;
    if (!idServicioEditar) {
      toast.error("Seleccioná un servicio");
      return;
    }
    if (!nombreEditar.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    const precioValue = parsePrecio(precioEditar);
    if (precioEditar.trim() && precioValue === null) {
      toast.error("Precio inválido");
      return;
    }

    try {
      await actualizarProducto(productoEditando.id, {
        id_servicio: Number(idServicioEditar),
        nombre: nombreEditar.trim(),
        descripcion: descripcionEditar.trim() || null,
        precio: precioValue,
        estado: estadoEditar,
      });
      toast.success("Producto actualizado correctamente");
      setDialogEditarAbierto(false);
      await cargarDatos();
    } catch {
      toast.error("No se pudo actualizar el producto");
    }
  };

  const handleClickEliminar = (producto: ProductoServicio) => {
    setProductoAEliminar(producto);
    setDialogEliminarAbierto(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!productoAEliminar) return;

    try {
      setEliminando(true);
      await eliminarProducto(productoAEliminar.id);
      setDialogEliminarAbierto(false);
      setProductos((prev) => prev.filter((p) => p.id !== productoAEliminar.id));
      setProductoAEliminar(null);
      toast.success("Producto eliminado correctamente");
    } catch {
      toast.error("No se pudo eliminar el producto");
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Page header ───────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Productos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestioná los productos asociados a cada servicio
        </p>
      </div>

      {/* ── Stat line ─────────────────────────────────────────────── */}
      {!cargando && productos.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <Package className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {productos.length}
          </span>
        </div>
      )}

      {/* ── Two-column layout ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:h-[calc(100vh-50px)]">

        {/* ── Create form ─────────────────────────────────────────── */}
        <div className="md:col-span-1 rounded-xl border bg-card overflow-hidden flex flex-col">
          <div className="h-0.5 w-full bg-primary shrink-0" />
          <div className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
            <p className="text-sm font-medium text-foreground">Nuevo producto</p>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Servicio <span className="text-destructive">*</span>
              </Label>
              <Select value={idServicio} onValueChange={setIdServicio}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Seleccioná un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {servicios.length === 0 ? (
                    <SelectItem value="sin-servicios" disabled>
                      No hay servicios disponibles
                    </SelectItem>
                  ) : (
                    servicios.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.nombre ?? "Servicio sin nombre"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nombre-producto" className="text-xs text-muted-foreground">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nombre-producto"
                className="h-9"
                placeholder="Ej: Canapé gourmet"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descripcion-producto" className="text-xs text-muted-foreground">
                Descripción
              </Label>
              <Textarea
                id="descripcion-producto"
                placeholder="Describe el producto"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="precio-producto" className="text-xs text-muted-foreground">
                Precio
              </Label>
              <Input
                id="precio-producto"
                type="number"
                className="h-9"
                placeholder="0"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Estado</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Seleccioná un estado" />
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
          <div className="p-5 pt-0 shrink-0">
            <Button className="w-full gap-2" onClick={handleCrear}>
              <Plus className="h-4 w-4" />
              Crear producto
            </Button>
          </div>
        </div>

        {/* ── Table panel ─────────────────────────────────────────── */}
        <div className="md:col-span-2 rounded-xl border bg-card overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1 min-h-0">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="pl-4 text-xs uppercase tracking-wider text-muted-foreground font-medium bg-card">
                    Producto
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium bg-card">
                    Servicio
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium bg-card">
                    Precio
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
                        Cargando productos…
                      </span>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-sm text-destructive">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : productos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-sm text-muted-foreground">
                      No hay productos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  productos.map((producto, index) => (
                    <TableRow
                      key={producto.id}
                      className="group border-b last:border-0 hover:bg-muted/40 transition-colors duration-150 animate-fade-in opacity-0"
                      style={{
                        animationDelay: `${index * 40}ms`,
                        animationFillMode: "forwards",
                      }}
                    >
                      <TableCell className="pl-4">
                        <span className="text-sm font-medium text-foreground block">
                          {producto.nombre ?? "Sin nombre"}
                        </span>
                        {producto.descripcion && (
                          <span className="text-xs text-muted-foreground truncate max-w-[160px] block">
                            {producto.descripcion}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {serviciosMap.get(producto.id_servicio) || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium tabular-nums text-foreground">
                          {formatCurrency(producto.precio)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm tabular-nums text-muted-foreground">
                          {formatDate(producto.created_at)}
                        </span>
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => handleAbrirEditar(producto)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleClickEliminar(producto)}
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
            <DialogTitle>Eliminar Producto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar el producto{" "}
              <span className="font-semibold text-foreground">
                {productoAEliminar?.nombre ?? "sin nombre"}
              </span>
              ? Esta acción no se puede deshacer.
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
            <DialogTitle>Editar producto</DialogTitle>
            <DialogDescription>
              Actualizá la información del producto seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Servicio</Label>
              <Select value={idServicioEditar} onValueChange={setIdServicioEditar}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {servicios.length === 0 ? (
                    <SelectItem value="sin-servicios" disabled>
                      No hay servicios disponibles
                    </SelectItem>
                  ) : (
                    servicios.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.nombre ?? "Servicio sin nombre"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre-editar">Nombre</Label>
              <Input
                id="nombre-editar"
                value={nombreEditar}
                onChange={(e) => setNombreEditar(e.target.value)}
                placeholder="Nombre del producto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion-editar">Descripción</Label>
              <Textarea
                id="descripcion-editar"
                value={descripcionEditar}
                onChange={(e) => setDescripcionEditar(e.target.value)}
                placeholder="Descripción del producto"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precio-editar">Precio</Label>
              <Input
                id="precio-editar"
                type="number"
                value={precioEditar}
                onChange={(e) => setPrecioEditar(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={estadoEditar} onValueChange={setEstadoEditar}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná un estado" />
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

export default Productos;
