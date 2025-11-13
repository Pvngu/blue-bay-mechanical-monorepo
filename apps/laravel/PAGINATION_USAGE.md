# Dynamic Page Size Feature

This API now supports dynamic page size control via the `page_size` query parameter.

## Quick Start

### Basic Usage
```bash
# Default pagination (15 items per page)
curl "http://localhost/api/v1/alumnos"

# Custom page size (25 items per page)
curl "http://localhost/api/v1/alumnos?page_size=25"

# Maximum items (100 per page)
curl "http://localhost/api/v1/alumnos?page_size=100"
```

### Combined with Other Features
```bash
# Page size + filters
curl "http://localhost/api/v1/alumnos?filter[carrera_id]=1&page_size=50"

# Page size + sorting + includes
curl "http://localhost/api/v1/alumnos?page_size=30&sort=nombre&include=carrera,inscripciones"

# Full example with all features
curl "http://localhost/api/v1/grupos?filter[periodo_id]=2&filter[profesor_id]=5&include=materia,periodo&sort=aula&page_size=40"
```

## Configuration

### Environment Variables
Add these to your `.env` file to customize pagination defaults:

```env
# Default number of items per page (default: 15)
PAGINATION_DEFAULT=15

# Minimum allowed page size (default: 1)
PAGINATION_MIN=1

# Maximum allowed page size (default: 100)
PAGINATION_MAX=100
```

### Config File
Alternatively, modify `config/app.php`:

```php
'pagination' => [
    'default' => 15,
    'min' => 1,
    'max' => 100,
],
```

## Validation

The system automatically validates and constrains the `page_size` parameter:

- **Too small**: `page_size=0` → automatically adjusted to minimum (1)
- **Too large**: `page_size=500` → automatically adjusted to maximum (100)
- **Invalid**: `page_size=abc` → defaults to configured default (15)
- **Missing**: no parameter → uses configured default (15)

## Implementation Details

All controllers now use the `HasPagination` trait which provides:

1. **Automatic page size extraction** from request parameters
2. **Validation and bounds checking** (min/max constraints)
3. **Fallback to configuration defaults** when parameter is missing or invalid
4. **Type casting** to ensure integer values

### Example Controller Implementation
```php
use App\Http\Traits\HasPagination;

class AlumnoController extends Controller
{
    use HasPagination;

    public function index(): JsonResponse
    {
        $alumnos = QueryBuilder::for(Alumno::class)
            ->allowedFilters([...])
            ->allowedSorts([...])
            ->allowedIncludes([...])
            ->paginate($this->getPageSize());  // Dynamic page size

        return response()->json($alumnos);
    }
}
```

## Response Format

The response includes pagination metadata reflecting the requested page size:

```json
{
  "data": [
    {...},
    {...}
  ],
  "links": {
    "first": "http://localhost/api/v1/alumnos?page=1&page_size=25",
    "last": "http://localhost/api/v1/alumnos?page=4&page_size=25",
    "prev": null,
    "next": "http://localhost/api/v1/alumnos?page=2&page_size=25"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 4,
    "path": "http://localhost/api/v1/alumnos",
    "per_page": 25,  // Reflects requested page_size
    "to": 25,
    "total": 100
  }
}
```

## Performance Considerations

- **Small page sizes (1-15)**: Better for mobile apps and incremental loading
- **Medium page sizes (16-50)**: Balanced for most web applications
- **Large page sizes (51-100)**: Use cautiously, may impact performance with complex includes

**Recommendation**: Start with default (15) and adjust based on your specific needs and performance metrics.

## All Endpoints Supporting Dynamic Page Size

- `/api/v1/alumnos`
- `/api/v1/alumnos-factores`
- `/api/v1/asistencias`
- `/api/v1/calificaciones`
- `/api/v1/carreras`
- `/api/v1/factores-riesgo`
- `/api/v1/grupos`
- `/api/v1/inscripciones`
- `/api/v1/materias`
- `/api/v1/periodos`
- `/api/v1/profesores`
- `/api/v1/unidades`
- `/api/v1/usuarios`

All index endpoints now support the `page_size` parameter!
