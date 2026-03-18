# Documentación — SaaS Cotizaciones

## Descripción general

SaaS Cotizaciones es una aplicación web para la gestión integral de cotizaciones comerciales. Está orientada a empresas de servicios (catering, eventos, producción, etc.) que necesitan crear, administrar y entregar cotizaciones profesionales a sus clientes de forma rápida y ordenada.

La aplicación permite armar cotizaciones a partir de un catálogo de servicios y productos, guardarlas como plantillas reutilizables, exportarlas en PDF o Word, y llevar un historial completo con filtros de búsqueda.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Estilos | Tailwind CSS + shadcn/ui (Radix UI) |
| Backend / BD | Supabase (PostgreSQL + Auth + RLS) |
| Exportación PDF | html2canvas + jsPDF |
| Exportación Word | Librería de generación de documentos Word |
| Estado global | React Context (Auth) + React Query |
| Enrutamiento | React Router v6 |

---

## Roles de usuario

El sistema maneja tres roles con distintos niveles de acceso, gestionados vía Row Level Security (RLS) en Supabase:

| Rol | Permisos |
|-----|----------|
| `admin` | Acceso total: crear, editar, eliminar cotizaciones, servicios, productos y usuarios |
| `editor` | Crear y editar cotizaciones, servicios y productos. No puede eliminar ni gestionar usuarios |
| `empleado` | Solo lectura: puede ver el historial y el detalle de cotizaciones |

---

## Estructura de rutas

```
/login                          → Pantalla de inicio de sesión
/                               → Historial de cotizaciones
/cotizaciones/:id               → Detalle de una cotización guardada
/nueva                          → Crear nueva cotización
/plantillas                     → Gestión de plantillas
/configuracion/perfil           → Configuración del perfil del usuario
/configuracion/usuarios         → Gestión de usuarios
/configuracion/invitaciones     → Invitaciones a nuevos usuarios
/configuracion/servicios        → Catálogo de servicios
/configuracion/productos        → Catálogo de productos
```

Todas las rutas excepto `/login` están protegidas por `ProtectedRoute`. Si el usuario no tiene sesión activa, es redirigido al login automáticamente.

---

## Módulos del sistema

### 1. Historial de cotizaciones (`/`)

Lista todas las cotizaciones guardadas en la base de datos. Permite:

- **Filtrar** por nombre de cliente, rango de fechas (fecha de creación) y estado
- **Buscar** cotizaciones por número o cliente
- **Ver el detalle** de cada cotización haciendo click en la fila
- **Eliminar** cotizaciones (solo admins) con confirmación por modal
- **Paginación** de resultados

La fecha que se muestra y por la que se filtra es la **fecha de guardado** (`created_at`), no la fecha del evento.

---

### 2. Nueva cotización (`/nueva`)

Es el módulo principal del sistema. Permite construir una cotización completa:

**Datos del encabezado:**
- Nombre del cliente
- Nombre del evento
- Fecha del evento
- Nombre del encargado y cargo
- Descuento global (%)
- Consideraciones / notas al pie

**Agregar productos:**
- Seleccionar un servicio del catálogo → se cargan sus productos
- Agregar productos uno a uno o todos de un servicio de golpe
- Los productos agregados desde catálogo no se duplican (detección por `productoId`)
- Editar cantidad y precio unitario de cada ítem inline

**Cálculo automático:**
- Subtotal por ítem (cantidad × precio unitario)
- Subtotal general
- IVA (19%)
- Descuento aplicado sobre el subtotal
- Total final

**Precarga desde plantilla o cotización existente:**
- Al navegar a `/nueva` con state de React Router, se puede precargar una plantilla o cotización existente
- Los datos se mapean automáticamente al formulario

**Acciones disponibles:**
- Vista previa en tiempo real (panel lateral)
- Guardar cotización en Supabase
- Guardar como plantilla
- Exportar a PDF
- Exportar a Word

---

### 3. Vista previa de cotización

Componente `VistaPrevia` que renderiza la cotización con formato de documento profesional:

- Logo y nombre de la empresa
- Número de cotización y fecha del evento (formato `dd/mm/yyyy`)
- Datos del cliente y evento
- Tabla de productos agrupados por servicio
- Resumen de totales con IVA y descuento
- Consideraciones al pie
- Validez de la cotización (30 días desde la fecha de emisión)

Este mismo componente se usa como base para la exportación a PDF.

---

### 4. Detalle de cotización (`/cotizaciones/:id`)

Muestra una cotización guardada en modo lectura con el mismo layout que la vista previa. Permite:

- Ver todos los datos de la cotización
- Cambiar el estado (`aprobada`, `pendiente`, `rechazada`, `expirada`)
- Exportar a PDF o Word desde el historial

---

### 5. Plantillas (`/plantillas`)

Permite guardar configuraciones de cotizaciones para reutilizarlas:

- Listar plantillas disponibles (propias y públicas)
- Crear plantilla desde una cotización armada
- Cargar una plantilla como punto de partida para una nueva cotización
- Eliminar plantillas propias

Las plantillas guardan: datos del cliente vacíos + productos organizados por servicio con cantidades y precios.

---

### 6. Catálogo de servicios (`/configuracion/servicios`)

Gestión del catálogo de servicios disponibles para las cotizaciones:

- Crear, editar y eliminar servicios
- Campos: nombre, descripción, estado (activo/inactivo)
- Al eliminar un servicio se eliminan también todos sus productos asociados
- La eliminación usa un Dialog de confirmación con advertencia explícita

---

### 7. Catálogo de productos (`/configuracion/productos`)

Gestión de los productos dentro de cada servicio:

- Crear, editar y eliminar productos
- Campos: nombre, descripción, precio, estado, servicio al que pertenece
- La eliminación usa un Dialog de confirmación
- Un producto siempre pertenece a un servicio

---

### 8. Configuración (`/configuracion`)

Sección de administración del sistema:

- **Perfil**: datos del usuario autenticado
- **Usuarios**: gestión de usuarios del equipo (en desarrollo)
- **Invitaciones**: envío de invitaciones a nuevos usuarios

---

## Modelo de datos (Supabase)

```
servicios
  ├── id, nombre, descripcion, estado
  └── created_at, updated_at

productos
  ├── id, id_servicio (FK → servicios)
  ├── nombre, descripcion, precio, estado
  └── created_at, updated_at

cotizaciones
  ├── id, numero, nombre_cliente, evento
  ├── fecha (fecha del evento), total, descuento
  ├── user_id (FK → auth.users)
  └── created_at, updated_at

cotizacion_cuerpo
  ├── id, cotizacion_id (FK → cotizaciones)
  ├── servicio_id (FK → servicios, ON DELETE SET NULL)
  ├── producto_id (FK → productos, ON DELETE SET NULL)
  ├── nombre_servicio, nombre_producto, descripcion_producto  ← datos copiados
  ├── cantidad, precio_unitario, subtotal
  └── created_at

cotizacion_consideraciones
  ├── id, cotizacion_id (FK → cotizaciones)
  ├── texto, orden
  └── created_at

plantillas
  ├── id, nombre, descripcion
  ├── es_publica, version, activo, descuento
  ├── user_id (FK → auth.users)
  └── created_at, updated_at

plantilla_servicios
  ├── id, plantilla_id (FK → plantillas)
  ├── servicio_id (FK → servicios, ON DELETE SET NULL)
  ├── nombre_servicio, descripcion_servicio  ← datos copiados
  └── orden, created_at

plantilla_productos
  ├── id, plantilla_servicio_id (FK → plantilla_servicios)
  ├── producto_id (FK → productos, ON DELETE SET NULL)
  ├── nombre_producto, descripcion_producto  ← datos copiados
  ├── cantidad, precio_unitario, subtotal
  └── created_at

profiles
  └── id (FK → auth.users), role, user_name

user_invitations
  └── id, email, role, invited_by, invited_at, expires_at, accepted_at
```

> **Nota sobre integridad referencial:** `cotizacion_cuerpo`, `plantilla_servicios` y `plantilla_productos` copian los datos de nombre y precio en el momento de guardar. Las FK hacia el catálogo usan `ON DELETE SET NULL`, por lo que eliminar un producto o servicio del catálogo no afecta el historial ni las plantillas existentes — solo se pierde la referencia, los datos copiados permanecen intactos.

---

## Localización

- Idioma: Español (Colombia)
- Moneda: COP (Peso colombiano, sin decimales)
- IVA: 19%
- Formato de fecha: `dd/mm/yyyy`
- Zona horaria: America/Bogota (implícita por la configuración del cliente)

---

## Comandos de desarrollo

```bash
pnpm dev          # Servidor de desarrollo (puerto 8080)
pnpm build        # Build de producción
pnpm build:dev    # Build de desarrollo
pnpm lint         # ESLint
pnpm test         # Tests con Vitest
pnpm test:ui      # Tests con interfaz visual
pnpm preview      # Preview del build de producción
```
