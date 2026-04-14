import { forwardRef } from "react";
import { DatosCotizacion } from "@/types/cotizacion";

interface VistaPreviaProps {
  datos: DatosCotizacion;
  onPrecioChange?: (productoId: string, nuevoPrecio: number) => void;
}

const VistaPrevia = forwardRef<HTMLDivElement, VistaPreviaProps>(({ datos, onPrecioChange }, ref) => {
  const subtotal = datos.productos.reduce(
    (acc, p) => acc + p.cantidad * p.precioUnitario,
    0
  );
  const descuentoMonto = subtotal * (datos.descuento / 100);
  const subtotalConDescuento = subtotal - descuentoMonto;
  const ivaPorcentaje = datos.iva ?? 19;
  const iva = subtotalConDescuento * (ivaPorcentaje / 100);
  const total = subtotalConDescuento + iva;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const today = new Date();
  const validUntil = new Date(today);
  validUntil.setDate(validUntil.getDate() + 30);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Agrupar productos por servicio
  const productosPorServicio = datos.productos.reduce((acc, producto) => {
    const nombreServicio = producto.nombreServicio || "Sin servicio";
    if (!acc[nombreServicio]) {
      acc[nombreServicio] = [];
    }
    acc[nombreServicio].push(producto);
    return acc;
  }, {} as Record<string, typeof datos.productos>);

  return (
    <div ref={ref} className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <h3 className="font-semibold text-foreground mb-4">Vista Previa de Cotización</h3>

      <div className="bg-card border border-border rounded-lg p-6 text-sm">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-border">
          <div className="flex items-center">
            <div className="h-12 px-4 flex items-center border border-dashed border-border rounded text-sm text-muted-foreground select-none">
              [Logo empresa]
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-foreground">COTIZACIÓN</h2>
            <p className="text-muted-foreground text-xs">Fecha: {datos.fecha ? datos.fecha.split("-").reverse().join("/") : formatDate(today)}</p>
          </div>
        </div>

        {/* Company Info */}
        <div className="mb-6 text-xs text-muted-foreground">
          <p>Ciudad, País</p>
          <p>contacto@empresa.com</p>
          <p>+00 000 000 0000</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Client Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-2">Cliente</h4>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p className="font-medium text-foreground">{datos.cliente || "Nombre del cliente"}</p>
            </div>
          </div>

          {/* Event Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-2">Evento</h4>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p className="font-medium text-foreground">{datos.evento || "Nombre del evento"}</p>
            </div>
          </div>
        </div>
        <div className="border-b border-border mb-6" />

        {/* Detail Tables by Service */}
        <div className="mb-6">
          <h4 className="font-semibold text-foreground mb-3">Detalles de los servicios y productos</h4>

          {datos.productos.length === 0 ? (
            <div className="border border-border rounded p-4 text-center text-muted-foreground text-xs">
              Agrega productos para ver el detalle
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(productosPorServicio).map(([nombreServicio, productos]) => (
                <div key={nombreServicio} className="border border-border rounded overflow-hidden">
                  {/* Service Header */}
                  <div className="bg-primary/10 px-3 py-2 border-b border-border">
                    <h5 className="font-semibold text-foreground text-xs">{nombreServicio}</h5>
                  </div>

                  {/* Products Table */}
                  <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[300px]">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-2 font-medium">Producto</th>
                        <th className="text-center p-2 font-medium w-12">Cant.</th>
                        <th className="text-right p-2 font-medium w-20">Precio</th>
                        <th className="text-right p-2 font-medium w-24">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map((producto) => {
                        const esEditable = producto.precioVariable && onPrecioChange;
                        return (
                          <tr key={producto.id} className="border-t border-border">
                            <td className="p-2">{producto.descripcion}</td>
                            <td className="p-2 text-center">{producto.cantidad}</td>
                            <td className="p-2 text-right">
                              {esEditable ? (
                                <input
                                  type="number"
                                  min="0"
                                  value={producto.precioUnitario || ""}
                                  placeholder="0"
                                  onChange={(e) =>
                                    onPrecioChange(producto.id, Math.max(0, Number(e.target.value)))
                                  }
                                  className="w-20 rounded border border-primary/40 bg-primary/5 px-1.5 py-0.5 text-right text-xs tabular-nums text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                                />
                              ) : (
                                formatCurrency(producto.precioUnitario)
                              )}
                            </td>
                            <td className="p-2 text-right">
                              {formatCurrency(producto.cantidad * producto.precioUnitario)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-full sm:w-48 space-y-1 text-xs">
            {(ivaPorcentaje > 0 || datos.descuento > 0) && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            )}
            {datos.descuento > 0 && (
              <div className="flex justify-between text-success">
                <span>Descuento ({datos.descuento}%):</span>
                <span>-{formatCurrency(descuentoMonto)}</span>
              </div>
            )}
            {ivaPorcentaje > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">IVA ({ivaPorcentaje}%):</span>
                <span>{formatCurrency(iva)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Consideraciones */}
        {datos.consideraciones && (
          <div className="mb-6">
            <h4 className="font-semibold text-foreground mb-2">Consideraciones</h4>
            <div className="text-xs text-muted-foreground whitespace-pre-line">
              {datos.consideraciones}
            </div>
          </div>
        )}

        {/* Signature */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <div className="text-xs">
            <p className="font-medium text-foreground">{datos.nombreEncargado || "Nombre del encargado"}</p>
            <p className="text-muted-foreground">{datos.cargo || "Cargo"}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

VistaPrevia.displayName = "VistaPrevia";

export default VistaPrevia;
