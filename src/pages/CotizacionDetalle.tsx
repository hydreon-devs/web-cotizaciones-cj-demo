import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CotizacionDetalle, obtenerCotizacionDetalle } from "@/services/cotizacionesService";
import { DatosCotizacion, Producto } from "@/types/cotizacion";
import { toast } from "sonner";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
};

const toNumber = (value: number | string | null | undefined): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const CotizacionDetallePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detalle, setDetalle] = useState<CotizacionDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    const cargarDetalle = async () => {
      if (!id) return;
      setCargando(true);
      setError(null);
      try {
        const data = await obtenerCotizacionDetalle(id);
        if (!activo) return;
        setDetalle(data);
      } catch (errorCarga) {
        if (!activo) return;
        console.error(errorCarga);
        setError("No se pudo cargar la cotización");
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarDetalle();

    return () => {
      activo = false;
    };
  }, [id]);

  const total = useMemo(() => {
    if (!detalle) return 0;
    return detalle.cuerpo.reduce(
      (acc, item) => acc + toNumber(item.cantidad) * toNumber(item.precio_unitario),
      0
    );
  }, [detalle]);

  const handleCrearDesde = () => {
    if (!detalle) return;

    const cot = detalle.cotizacion;
    const consideraciones = detalle.consideraciones
      .map((item) => item.texto)
      .filter(Boolean)
      .join("\n");

    const productos: Producto[] = detalle.cuerpo.map((item, index) => ({
      id: `${item.id ?? item.producto_id ?? index}`,
      descripcion: item.nombre_producto,
      cantidad: toNumber(item.cantidad),
      precioUnitario: toNumber(item.precio_unitario),
      productoId: item.producto_id ?? null,
      servicioId: item.servicio_id ?? null,
      nombreServicio: item.nombre_servicio ?? "Servicio",
      descripcionProducto: item.descripcion_producto ?? null,
    }));

    const datos: DatosCotizacion = {
      cliente: cot.nombre_cliente ?? "",
      evento: cot.evento ?? "",
      consideraciones,
      descuento: toNumber(cot.descuento ?? 0),
      fecha: cot.fecha ?? "",
      nombreEncargado: "Carlos Jaramillo",
      cargo: "Director general",
      productos,
    };

    navigate("/nueva", { state: { cotizacion: datos } });
    toast.success("Cotización cargada para edición");
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Volver</span>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Detalle de cotización</h1>
              <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
                Revisa la información completa y crea una nueva cotización
              </p>
            </div>
          </div>
          <Button onClick={handleCrearDesde} disabled={!detalle || cargando} className="w-full sm:w-auto">
            <Copy className="h-4 w-4 mr-2" />
            <span className="sm:hidden">Duplicar</span>
            <span className="hidden sm:inline">Crear cotización a partir de esta</span>
          </Button>
        </div>

        {cargando ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando cotización...
              </span>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-10 text-center text-destructive">{error}</CardContent>
          </Card>
        ) : detalle ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información general</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Cliente</span>
                  <div className="font-medium">{detalle.cotizacion.nombre_cliente ?? "-"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Evento</span>
                  <div className="font-medium">{detalle.cotizacion.evento ?? "-"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Fecha</span>
                  <div className="font-medium">{detalle.cotizacion.fecha ?? "-"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Descuento</span>
                  <div className="font-medium">{toNumber(detalle.cotizacion.descuento)}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total</span>
                  <div className="font-semibold text-primary">{formatCurrency(total)}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Productos incluidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Producto</th>
                        <th className="text-left p-3 font-medium">Servicio</th>
                        <th className="text-center p-3 font-medium">Cant.</th>
                        <th className="text-right p-3 font-medium">Precio</th>
                        <th className="text-right p-3 font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalle.cuerpo.map((item) => (
                        <tr key={item.id} className="border-t border-border">
                          <td className="p-3">
                            <div className="font-medium text-foreground">
                              {item.nombre_producto}
                            </div>
                            {item.descripcion_producto && (
                              <div className="text-xs text-muted-foreground">
                                {item.descripcion_producto}
                              </div>
                            )}
                          </td>
                          <td className="p-3">{item.nombre_servicio}</td>
                          <td className="p-3 text-center">{toNumber(item.cantidad)}</td>
                          <td className="p-3 text-right">
                            {formatCurrency(toNumber(item.precio_unitario))}
                          </td>
                          <td className="p-3 text-right">
                            {formatCurrency(toNumber(item.subtotal))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Consideraciones</CardTitle>
              </CardHeader>
              <CardContent>
                {detalle.consideraciones.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay consideraciones.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {detalle.consideraciones.map((item) => (
                      <li key={item.id} className="text-foreground">
                        • {item.texto}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
    </div>
  );
};

export default CotizacionDetallePage;
