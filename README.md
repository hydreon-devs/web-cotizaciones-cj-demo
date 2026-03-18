# SaaS Cotizaciones

Sistema web para la gestión integral de cotizaciones comerciales. Pensado para empresas de servicios (catering, eventos, producción, etc.) que necesitan crear, administrar y entregar cotizaciones profesionales a sus clientes.

---

## Qué hace

- **Historial de cotizaciones**: listado con filtros por cliente, fechas y estado; ver detalle, eliminar (según rol).
- **Nueva cotización**: formulario con datos del cliente/evento, selección de servicios y productos desde catálogo, descuentos, cálculos automáticos (subtotal, IVA 19 %, total).
- **Vista previa y exportación**: documento tipo cotización en pantalla; exportar a PDF (html2canvas + jsPDF) o Word (docx).
- **Plantillas**: guardar cotizaciones como plantillas y usarlas como base para nuevas cotizaciones.
- **Catálogos**: CRUD de servicios y productos que alimentan las cotizaciones.
- **Configuración**: perfil de usuario, usuarios del equipo, invitaciones (en desarrollo).
- **Autenticación y roles**: login con Supabase Auth; roles `admin`, `editor` y `empleado` con permisos distintos (RLS en Supabase).

---

## Cómo lo hace

- **Frontend**: SPA en React 18 + TypeScript + Vite. UI con Tailwind CSS y componentes shadcn/ui (Radix).
- **Backend y persistencia**: Supabase (PostgreSQL, Auth, Row Level Security). Servicios en `src/services/` y capa `src/api/` para auth y conexión.
- **Estado**: Auth vía React Context; datos remotos con React Query; estado local en formularios y filtros.
- **Rutas**: React Router v6; rutas protegidas con `ProtectedRoute`; layout común con sidebar y header.
- **Exportación**: PDF desde el DOM de la vista previa; Word con la librería `docx`.

---

## Stack tecnológico

| Capa           | Tecnología                          |
|----------------|-------------------------------------|
| Frontend       | React 18, TypeScript, Vite          |
| Estilos        | Tailwind CSS, shadcn/ui (Radix UI)  |
| Backend / BD   | Supabase (PostgreSQL, Auth, RLS)    |
| PDF            | html2canvas, jsPDF                  |
| Word           | docx, file-saver                    |
| Estado         | React Context (Auth), React Query  |
| Enrutamiento   | React Router v6                     |
| Formularios    | React Hook Form, Zod                |
| Tema           | next-themes (claro/oscuro)          |

---

## Estructura del proyecto

```
SaaS_Cotizaciones/
├── index.html
├── package.json
├── vite.config.ts          # Vite, puerto 8080, alias @ → src
├── DOCUMENTACION.md        # Documentación detallada del sistema
├── CLAUDE.md               # Guía para asistente de código
│
└── src/
    ├── main.tsx            # Punto de entrada, render de App
    ├── App.tsx              # Providers, rutas y layout protegido
    ├── layaut.tsx          # Layout con sidebar y outlet de rutas
    ├── vite-env.d.ts
    │
    ├── api/                # Conexión Supabase y lógica de auth
    │   ├── conection.ts    # Cliente Supabase
    │   ├── cookieStorage.ts
    │   └── auth/           # signin, signout, getSession, getProfile, getRole, inviteuser
    │
    ├── components/         # Componentes reutilizables
    │   ├── Header.tsx
    │   ├── ProtectedRoute.tsx
    │   ├── VistaPrevia.tsx       # Vista previa y base del PDF
    │   ├── StatusBadge.tsx
    │   ├── ThemeToggle.tsx
    │   ├── ThemeProvider.tsx
    │   ├── NavLink.tsx
    │   ├── PageTransition.tsx
    │   ├── componentsConfiguracion/
    │   │   └── sideBar.tsx
    │   └── ui/             # Componentes shadcn/ui (button, dialog, form, table, etc.)
    │
    ├── contexts/
    │   └── AuthContext.tsx  # Estado y lógica de autenticación
    │
    ├── hooks/
    │   ├── use-toast.ts
    │   └── use-mobile.tsx
    │
    ├── lib/
    │   └── utils.ts        # Utilidades (cn, etc.)
    │
    ├── pages/              # Páginas por ruta
    │   ├── Login.tsx
    │   ├── Index.tsx       # Redirige al listado de cotizaciones
    │   ├── CotizacionesLista.tsx
    │   ├── CotizacionDetalle.tsx
    │   ├── NuevaCotizacion.tsx
    │   ├── Plantillas.tsx
    │   ├── Servicios.tsx
    │   ├── Productos.tsx
    │   ├── Configuracion.tsx
    │   ├── NotFound.tsx
    │   ├── Database.tsx
    │   └── configuracion/
    │       ├── Perfil.tsx
    │       ├── Usuarios.tsx
    │       ├── Invitaciones.tsx
    │       ├── Servicios.tsx
    │       └── Productos.tsx
    │
    ├── services/           # Lógica de negocio y acceso a datos
    │   ├── cotizacionesService.ts
    │   ├── plantillasService.ts
    │   ├── serviciosService.ts
    │   ├── productosService.ts
    │   ├── wordExportService.ts
    │   └── ...
    │
    ├── types/
    │   └── cotizacion.ts   # Tipos (Cotizacion, Producto, DatosCotizacion, etc.)
    │
    ├── data/               # Datos mock (si aplica)
    │   └── cotizaciones.ts
    │
    └── utils/
        └── const.tsx       # Constantes de la app
```

---

## Cómo arrancar el aplicativo

### Requisitos

- Node.js (recomendado v18+)
- pnpm (o npm/yarn)

### Instalación

```bash
git clone <url-del-repositorio>
cd gestor-cotizaciones
pnpm install
```

### Variables de entorno

Crea un archivo `.env` en la raíz con las variables que usa Vite para Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

Los nombres deben ser exactamente esos para que el frontend se conecte a tu proyecto Supabase.

### Comandos

| Comando        | Descripción                          |
|----------------|--------------------------------------|
| `pnpm dev`     | Servidor de desarrollo (puerto 8080) |
| `pnpm build`   | Build de producción                  |
| `pnpm build:dev` | Build en modo desarrollo           |
| `pnpm preview` | Previsualizar el build de producción|
| `pnpm lint`    | Ejecutar ESLint                      |
| `pnpm test`    | Tests con Vitest                     |
| `pnpm test:ui` | Tests con interfaz de Vitest         |

Tras `pnpm dev`, la app suele estar en `http://localhost:8080`.

---

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/login` | Inicio de sesión |
| `/` | Historial de cotizaciones |
| `/cotizaciones/:id` | Detalle de una cotización |
| `/nueva` | Crear nueva cotización |
| `/plantillas` | Gestión de plantillas |
| `/configuracion/perfil` | Perfil del usuario |
| `/configuracion/usuarios` | Usuarios del equipo |
| `/configuracion/invitaciones` | Invitaciones |
| `/configuracion/servicios` | Catálogo de servicios |
| `/configuracion/productos` | Catálogo de productos |

Todas las rutas salvo `/login` requieren sesión; si no hay usuario autenticado se redirige al login.

---

## Roles de usuario

Los permisos se controlan con RLS en Supabase:

- **admin**: crear, editar y eliminar cotizaciones, servicios, productos y gestión de usuarios.
- **editor**: crear y editar cotizaciones, servicios y productos; no eliminar ni gestionar usuarios.
- **empleado**: solo lectura (historial y detalle de cotizaciones).

---

## Localización

- Idioma: español (Colombia).
- Moneda: COP (peso colombiano), IVA 19 %.
- Fechas: formato `dd/mm/yyyy`.

---

## Documentación adicional

- **DOCUMENTACION.md**: descripción de módulos, modelo de datos en Supabase, flujos y convenciones del proyecto.
