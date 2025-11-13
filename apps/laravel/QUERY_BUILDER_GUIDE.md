# API Query Builder Documentation

This API uses [spatie/laravel-query-builder](https://github.com/spatie/laravel-query-builder) for powerful filtering, sorting, and including relationships.

## Base URL
All endpoints are prefixed with `/api/v1/` (configured in `bootstrap/app.php`).

## Query Parameters

### Filtering
Use the `filter` parameter to filter results:

```
GET /api/v1/alumnos?filter[nombre]=Juan&filter[semestre]=5
GET /api/v1/grupos?filter[materia_id]=1&filter[periodo_id]=2
GET /api/v1/asistencias?filter[fecha]=2025-10-23&filter[estatus]=presente
```

### Sorting
Use the `sort` parameter to sort results (prefix with `-` for descending):

```
GET /api/v1/carreras?sort=nombre
GET /api/v1/profesores?sort=-created_at
GET /api/v1/calificaciones?sort=-valor_calificacion
```

### Including Relationships
Use the `include` parameter to eager-load relationships:

```
GET /api/v1/alumnos?include=carrera,inscripciones
GET /api/v1/grupos?include=materia,profesor,periodo,carrera
GET /api/v1/inscripciones?include=alumno,grupo,calificaciones,asistencias
```

### Combining Parameters
You can combine filters, sorts, and includes:

```
GET /api/v1/alumnos?filter[carrera_id]=1&filter[semestre]=5&sort=-created_at&include=carrera,inscripciones
GET /api/v1/grupos?filter[periodo_id]=2&filter[profesor_id]=3&include=materia,inscripciones&sort=aula
```

## Available Filters, Sorts, and Includes per Resource

### Periodos
- **Filters**: `nombre`, `activo`, `fecha_inicio`, `fecha_fin`
- **Sorts**: `nombre`, `fecha_inicio`, `fecha_fin`, `activo`, `created_at`
- **Includes**: `grupos`

### Carreras
- **Filters**: `nombre`, `clave`
- **Sorts**: `nombre`, `clave`, `created_at`
- **Includes**: `alumnos`, `grupos`

### Usuarios
- **Filters**: `email`, `rol`
- **Sorts**: `email`, `rol`, `created_at`
- **Includes**: `profesor`, `alumno`

### Profesores
- **Filters**: `nombre`, `apellido_paterno`, `apellido_materno`, `rfc`, `usuario_id` (exact)
- **Sorts**: `nombre`, `apellido_paterno`, `rfc`, `created_at`
- **Includes**: `usuario`, `grupos`

### Alumnos
- **Filters**: `nombre`, `apellido_paterno`, `apellido_materno`, `matricula`, `semestre`, `genero`, `modalidad`, `carrera_id` (exact), `usuario_id` (exact)
- **Sorts**: `nombre`, `apellido_paterno`, `matricula`, `semestre`, `created_at`
- **Includes**: `usuario`, `carrera`, `inscripciones`

### Materias
- **Filters**: `nombre`, `codigo_materia`, `creditos`
- **Sorts**: `nombre`, `codigo_materia`, `creditos`, `created_at`
- **Includes**: `unidades`, `grupos`

### Unidades
- **Filters**: `nombre_unidad`, `numero_unidad`, `materia_id` (exact)
- **Sorts**: `numero_unidad`, `nombre_unidad`, `created_at`
- **Includes**: `materia`, `calificaciones`

### Factores de Riesgo
- **Filters**: `nombre`, `categoria`
- **Sorts**: `nombre`, `categoria`, `created_at`
- **Includes**: `alumnosFactores`

### Grupos
- **Filters**: `horario`, `aula`, `materia_id` (exact), `profesor_id` (exact), `periodo_id` (exact), `carrera_id` (exact)
- **Sorts**: `aula`, `created_at`
- **Includes**: `materia`, `profesor`, `periodo`, `carrera`, `inscripciones`

### Inscripciones
- **Filters**: `calificacion_final`, `alumno_id` (exact), `grupo_id` (exact)
- **Sorts**: `calificacion_final`, `created_at`
- **Includes**: `alumno`, `grupo`, `calificaciones`, `asistencias`, `alumnosFactores`

### Calificaciones
- **Filters**: `valor_calificacion`, `inscripcion_id` (exact), `unidad_id` (exact)
- **Sorts**: `valor_calificacion`, `created_at`
- **Includes**: `inscripcion`, `unidad`

### Asistencias
- **Filters**: `fecha`, `estatus`, `inscripcion_id` (exact)
- **Sorts**: `fecha`, `estatus`, `created_at`
- **Includes**: `inscripcion`

### Alumnos-Factores
- **Filters**: `fecha_registro`, `observaciones`, `inscripcion_id` (exact), `factor_id` (exact)
- **Sorts**: `fecha_registro`, `created_at`
- **Includes**: `inscripcion`, `factor`

## Example Use Cases

### Get all students from a specific career with their enrollments
```
GET /api/v1/alumnos?filter[carrera_id]=1&include=carrera,inscripciones
```

### Get all groups for a specific professor in the current period
```
GET /api/v1/grupos?filter[profesor_id]=5&filter[periodo_id]=2&include=materia,periodo
```

### Get attendance records for a student in a specific enrollment
```
GET /api/v1/asistencias?filter[inscripcion_id]=10&sort=fecha&include=inscripcion
```

### Get grades for all students in a specific group
```
GET /api/v1/inscripciones?filter[grupo_id]=3&include=alumno,calificaciones&sort=calificacion_final
```

### Search for students by name or ID
```
GET /api/v1/alumnos?filter[nombre]=Maria&sort=apellido_paterno
GET /api/v1/alumnos?filter[matricula]=20250123
```

## Pagination
All list endpoints are paginated with 15 items per page by default. The response includes pagination metadata:

```json
{
  "data": [...],
  "links": {
    "first": "...",
    "last": "...",
    "prev": null,
    "next": "..."
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "per_page": 15,
    "to": 15,
    "total": 73
  }
}
```

### Custom Page Size
You can control the number of items per page using the `page_size` parameter:

```
GET /api/v1/alumnos?page_size=25
GET /api/v1/grupos?page_size=50&filter[periodo_id]=2
GET /api/v1/inscripciones?page_size=100&include=alumno,grupo
```

**Constraints:**
- **Default**: 15 items per page
- **Minimum**: 1 item per page
- **Maximum**: 100 items per page

Any value outside these bounds will be automatically adjusted to the nearest valid value.

**Configuration:**
You can modify these defaults in `config/app.php` or via environment variables:
- `PAGINATION_DEFAULT` - Default page size (default: 15)
- `PAGINATION_MIN` - Minimum allowed page size (default: 1)
- `PAGINATION_MAX` - Maximum allowed page size (default: 100)

**Examples:**
```
# Get 50 students per page
GET /api/v1/alumnos?page_size=50

# Combine with other parameters
GET /api/v1/alumnos?filter[carrera_id]=1&page_size=25&sort=nombre&include=carrera

# Navigate through pages with custom size
GET /api/v1/alumnos?page=1&page_size=30
GET /api/v1/alumnos?page=2&page_size=30
```

## Notes
- Filters marked as "(exact)" require an exact match and are case-sensitive for IDs
- Text filters (like `nombre`, `email`) use partial matching (LIKE %value%)
- Date filters accept ISO 8601 format: `YYYY-MM-DD`
- Multiple values for the same filter can be combined with commas: `sort=nombre,-created_at`
