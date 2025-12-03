# Sistema de Agendamiento de Citas

Sistema completo de calendario y reservas construido con Next.js, TypeScript, React Big Calendar, TanStack Query, y SQLite.

## Características

- 📅 Calendario interactivo con vistas mensual, semanal y diaria
- ✨ Crear, editar y cancelar citas
- 👥 Gestión de proveedores y servicios
- ⏰ Validación de disponibilidad y detección de conflictos
- 🎨 Interfaz moderna con Tailwind CSS
- 💾 Base de datos SQLite local (sin configuración adicional)
- 🔄 Actualizaciones en tiempo real con React Query

## Tecnologías

- **Frontend**: Next.js 16, React 19, TypeScript
- **Estilos**: Tailwind CSS
- **Calendario**: React Big Calendar
- **Formularios**: React Hook Form + Zod
- **Estado del servidor**: TanStack Query (React Query)
- **Base de datos**: SQLite (better-sqlite3)
- **Fechas**: Day.js

## Instalación

Las dependencias ya están instaladas. Si necesitas reinstalar:

```bash
npm install
```

## Inicializar Base de Datos

Ejecuta este comando para crear la base de datos con datos de ejemplo:

```bash
npm run db:seed
```

Esto creará el archivo `local.db` con:
- 3 proveedores de ejemplo
- 5 tipos de servicios
- Horarios de disponibilidad (Lunes a Viernes, 9AM - 5PM)
- 3 citas de ejemplo

## Ejecutar en Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Uso

### Crear una cita

1. Click en "Nueva Cita" o selecciona un espacio en el calendario
2. Completa el formulario con los datos del cliente y detalles de la cita
3. Click en "Guardar cita"

### Ver detalles de una cita

- Click en cualquier cita del calendario

### Cancelar una cita

- Abrir los detalles de la cita
- Click en "Cancelar cita"

## Base de Datos

El archivo `local.db` se guarda en la raíz del proyecto.

### Reiniciar la base de datos

```bash
rm local.db
npm run db:seed
```

## API Endpoints

- `GET /api/appointments` - Listar citas
- `POST /api/appointments` - Crear cita
- `PUT /api/appointments/[id]` - Actualizar cita
- `DELETE /api/appointments/[id]` - Cancelar cita
- `GET /api/availability` - Obtener slots disponibles
- `GET /api/providers` - Listar proveedores
- `GET /api/services` - Listar servicios

## Estructura del Proyecto

```
src/
├── app/              # Next.js App Router
├── components/       # Componentes React
├── db/              # Base de datos SQLite
├── hooks/           # React Query hooks
├── lib/             # Utilidades y validaciones
└── types/           # TypeScript types
```

## Personalización

### Cambiar horarios de negocio

Edita `src/lib/business-rules.ts`:

```typescript
export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  start: '09:00',
  end: '17:00',
  daysOfWeek: [1, 2, 3, 4, 5], // Lunes a Viernes
};
```

## Licencia

MIT
