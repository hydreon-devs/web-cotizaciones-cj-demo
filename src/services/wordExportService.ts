import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  Header,
  Footer,
  AlignmentType,
  WidthType,
  PageNumber,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import { DatosCotizacion } from "@/types/cotizacion";

interface TotalesCalculados {
  subtotal: number;
  descuentoMonto: number;
  subtotalConDescuento: number;
  iva: number;
  total: number;
}

export class WordExportService {
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  private static calcularTotales(datos: DatosCotizacion): TotalesCalculados {
    const subtotal = datos.productos.reduce(
      (acc, p) => acc + p.cantidad * p.precioUnitario,
      0
    );
    const descuentoMonto = subtotal * (datos.descuento / 100);
    const subtotalConDescuento = subtotal - descuentoMonto;
    const ivaPorcentaje = datos.iva ?? 19;
    const iva = subtotalConDescuento * (ivaPorcentaje / 100);
    const total = subtotalConDescuento + iva;

    return { subtotal, descuentoMonto, subtotalConDescuento, iva, total };
  }

  private static formatDate(fecha: string): string {
    if (!fecha) {
      return new Date().toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
    return new Date(fecha).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  private static formatDateLong(fecha: Date): string {
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
    
    return `${mes} ${dia} del ${año}`;
  }

  private static formatDateLongInverted(fecha: Date): string {
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
    
    return `${dia} de ${mes} del ${año}`;
  }
  
  private static crearHeader(): Header {
    return new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.LEFT,
          children: [
            new TextRun({
              text: "[Logo empresa]",
              bold: true,
              size: 28,
              color: "888888",
            }),
          ],
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: "E0E0E0" },
          },
        }),
      ],
    });
  }

  private static crearFooter(): Footer {
    return new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Página ",
              color: "666666",
            }),
            new TextRun({
              children: [PageNumber.CURRENT],
              color: "666666",
            }),
            new TextRun({
              text: " de ",
              color: "666666",
            }),
            new TextRun({
              children: [PageNumber.TOTAL_PAGES],
              color: "666666",
            }),
          ],
        }),
      ],
    });
  }

  private static crearSeccionIntroduccion(datos: DatosCotizacion): Paragraph[] {
    const fechaHoy = new Date();
    const fechaEvento = datos.fecha ? new Date(datos.fecha) : null;
    return [
      // Fecha actual
      new Paragraph({
        children: [
          new TextRun({
            text: this.formatDateLong(fechaHoy),
          }),
        ],
        spacing: { after: 200 },
      }),
      // Cliente
      new Paragraph({
        children: [
          new TextRun({
            text: "Sr./Sra.",
          }),
        ],
        spacing: { after: 50 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: datos.cliente || "Sin especificar",
            bold: true,
          }),
        ],
        spacing: { after: 300 },
      }),
      // Párrafo del evento
      new Paragraph({
        children: [
          new TextRun({
            text: "La siguiente es la cotización para: ",
          }),
          new TextRun({
            text: datos.evento || "el evento",
            bold: true,
          }),
          new TextRun({
            text: ", que se realizará el día ",
          }),
          new TextRun({
            text: fechaEvento ? this.formatDateLongInverted(fechaEvento) : "a confirmar",
            bold: true,
          }),
          new TextRun({
            text: ".",
          }),
        ],
        spacing: { after: 400 },
      }),
    ];
  }

  private static crearSeccionesServicios(datos: DatosCotizacion): Paragraph[] {
    // Agrupar productos por servicio
    const productosPorServicio = datos.productos.reduce((acc, producto) => {
      const nombreServicio = producto.nombreServicio || "Sin servicio";
      if (!acc[nombreServicio]) {
        acc[nombreServicio] = [];
      }
      acc[nombreServicio].push(producto);
      return acc;
    }, {} as Record<string, typeof datos.productos>);

    const elementos: Paragraph[] = [];

    Object.entries(productosPorServicio).forEach(([nombreServicio, productos]) => {
      // Calcular total del servicio
      const totalServicio = productos.reduce(
        (acc, p) => acc + p.cantidad * p.precioUnitario,
        0
      );

      // Encabezado del servicio con el total
      elementos.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${nombreServicio} - ${this.formatCurrency(totalServicio)}`,
              bold: true,
            }),
          ],
          spacing: { before: 200, after: 100 },
        })
      );

      // Encabezado "Producto" (sin viñeta)
      elementos.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Productos:",
              bold: true,
            }),
          ],
          spacing: { after: 50 },
        })
      );

      // Lista de productos con viñetas
      productos.forEach((producto) => {
        elementos.push(
          new Paragraph({
            children: [
              new TextRun({
                text: producto.descripcion,
              }),
            ],
            bullet: {
              level: 0,
            },
          })
        );
      });

      // Espacio después de cada servicio
      elementos.push(new Paragraph({ spacing: { after: 200 } }));
    });

    return elementos;
  }

  private static crearSeccionTotales(datos: DatosCotizacion): Paragraph[] {
    const totales = this.calcularTotales(datos);
    const ivaPorcentaje = datos.iva ?? 19;
    const paragraphs: Paragraph[] = [new Paragraph({ spacing: { before: 300 } })];

    if (ivaPorcentaje > 0 || datos.descuento > 0) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: "Subtotal: " }),
            new TextRun({ text: this.formatCurrency(totales.subtotal) }),
          ],
        })
      );
    }

    if (datos.descuento > 0) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: `Descuento (${datos.descuento}%): `,
              color: "22c55e",
            }),
            new TextRun({
              text: `-${this.formatCurrency(totales.descuentoMonto)}`,
              color: "22c55e",
            }),
          ],
        })
      );
    }

    if (ivaPorcentaje > 0) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: `IVA (${ivaPorcentaje}%): ` }),
            new TextRun({ text: this.formatCurrency(totales.iva) }),
          ],
        })
      );
    }

    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({ text: "TOTAL: ", bold: true }),
          new TextRun({ text: this.formatCurrency(totales.total), bold: true }),
        ],
        spacing: { after: 400 },
      })
    );

    return paragraphs;
  }

  private static crearSeccionConsideraciones(datos: DatosCotizacion): Paragraph[] {
    if (!datos.consideraciones || datos.consideraciones.trim() === "") {
      return [];
    }

    const lineas = datos.consideraciones.split("\n").filter((l) => l.trim());

    return [
      new Paragraph({
        children: [new TextRun({ text: "Consideraciones", bold: true })],
        spacing: { before: 400, after: 200 },
      }),
      ...lineas.map(
        (linea) =>
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: linea.trim() })],
          })
      ),
    ];
  }

  private static crearSeccionFirma(datos: DatosCotizacion): Paragraph[] {
    return [
      new Paragraph({ spacing: { before: 600 } }),
      new Paragraph({
        children: [
          new TextRun({
            text: datos.nombreEncargado || "Nombre del encargado",
            bold: true,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: datos.cargo || "Cargo",
            color: "666666",
          }),
        ],
      }),
      new Paragraph({
        children: [
        ],
      }),
    ];
  }

  static async generarDocumento(datos: DatosCotizacion): Promise<void> {
    const header = this.crearHeader();
    const footer = this.crearFooter();
    const seccionFirma = this.crearSeccionFirma(datos);

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: "Century Gothic",
              size: 24,
            },
          },
        },
      },
      sections: [
        {
          headers: { default: header },
          footers: { default: footer },
          children: [
            ...this.crearSeccionIntroduccion(datos),
            new Paragraph({
              children: [
                new TextRun({ text: "Los servicios que ofrecemos son los siguientes:", bold: true }),
              ],
              spacing: { after: 200 },
            }),
            ...this.crearSeccionesServicios(datos),
            ...this.crearSeccionTotales(datos),
            ...this.crearSeccionConsideraciones(datos),
            ...seccionFirma,
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const fileName = datos.cliente
      ? `cotizacion-${datos.cliente.replace(/\s+/g, "-").toLowerCase()}.docx`
      : "cotizacion.docx";

    saveAs(blob, fileName);
  }
}
