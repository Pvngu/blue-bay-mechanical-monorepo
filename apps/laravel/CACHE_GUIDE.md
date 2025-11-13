# Cache Implementation Guide

## Overview

This project implements a professional caching strategy for Laravel controllers using the `HasModelCache` trait. The implementation provides automatic cache invalidation, support for cache tags, and flexible TTL configuration.

## Features

- **Automatic Cache Invalidation**: Cache is automatically cleared when data is created, updated, or deleted
- **Query-Based Caching**: Index endpoints cache based on query parameters (filters, sorts, includes)
- **Individual Resource Caching**: Single resources are cached separately for faster retrieval
- **Cache Tags Support**: When using Redis or Memcached, cache tags allow selective cache clearing
- **Fallback for Non-Tag Drivers**: Works with all cache drivers (file, database, redis, memcached, etc.)
- **Configurable TTL**: Cache time-to-live can be configured globally or per controller

## Configuration

### Cache Driver

Set your preferred cache driver in `.env`:

```env
CACHE_STORE=redis  # or database, file, memcached, etc.
```

### Cache TTL

Default cache TTL is 1 hour (3600 seconds). You can customize it in `.env`:

```env
CACHE_TTL=7200  # 2 hours
```

## Usage in Controllers

### Basic Implementation

```php
use App\Http\Traits\HasModelCache;

class CarreraController extends Controller
{
    use HasModelCache;

    protected function getModelClass(): string
    {
        return Carrera::class;
    }

    public function index(): JsonResponse
    {
        $cacheKey = 'index:' . md5(request()->getQueryString() ?? 'default');

        $carreras = $this->cacheRemember($cacheKey, function () {
            return QueryBuilder::for(Carrera::class)
                ->allowedFilters(['nombre', 'clave'])
                ->paginate($this->getPageSize());
        });

        return response()->json($carreras);
    }

    public function store(Request $request): JsonResponse
    {
        $carrera = Carrera::create($request->validated());
        $this->clearModelCache();  // Clear cache after modification
        return response()->json($carrera, 201);
    }
}
```

### Custom Cache TTL

Override the `getCacheTTL()` method to set a custom TTL for a specific controller:

```php
protected function getCacheTTL(): int
{
    return 1800; // 30 minutes
}
```

### Cache Tags

Cache tags are automatically used when the cache driver supports them (Redis, Memcached). Tags allow you to clear only related cache entries:

```php
// This will only clear cache with the 'carrera' tag
$this->clearModelCache();
```

## Cache Keys Structure

The caching system uses a hierarchical key structure:

```
{model}:index:{query_hash}    # For list/index endpoints
{model}:show:{id}              # For individual resources
```

Example:
```
carrera:index:5d41402abc4b2a76b9719d911017c592
carrera:show:123
```

## Cache Invalidation Strategy

### Automatic Invalidation

Cache is automatically cleared on:
- **Create**: After a new record is created
- **Update**: After an existing record is updated
- **Delete**: After a record is deleted

### Manual Invalidation

You can manually clear cache when needed:

```php
// In your controller
$this->clearModelCache();

// Or using Cache facade directly
Cache::tags(['carrera'])->flush();  // With tags support
Cache::flush();                      // Without tags support
```

## Best Practices

1. **Use Cache Tags**: If possible, use Redis or Memcached for better cache management with tags
2. **Cache Query Results**: Cache expensive database queries, especially those with joins or complex filters
3. **Set Appropriate TTL**: Balance between freshness and performance
4. **Monitor Cache Hit Rate**: Use Laravel Telescope or similar tools to monitor cache effectiveness
5. **Clear Cache on Import**: If you bulk import data, remember to clear the cache

## Performance Considerations

### When to Cache

✅ **Good candidates for caching:**
- List endpoints with filters and pagination
- Individual resource retrieval (show endpoints)
- Complex queries with multiple joins
- Rarely changing data

❌ **Bad candidates for caching:**
- Real-time data that changes frequently
- User-specific data (unless using tagged cache)
- Data with very short TTL requirements

### Cache Drivers Comparison

| Driver     | Speed | Tags Support | Persistence | Best For                    |
|------------|-------|--------------|-------------|-----------------------------|
| Redis      | ⚡⚡⚡ | ✅           | ✅          | Production, high traffic    |
| Memcached  | ⚡⚡⚡ | ✅           | ❌          | Production, no persistence  |
| Database   | ⚡    | ❌           | ✅          | Simple setups               |
| File       | ⚡⚡  | ❌           | ✅          | Development, small apps     |

## Testing

### Clear Cache in Tests

```php
use Illuminate\Support\Facades\Cache;

class CarreraControllerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush(); // Clear cache before each test
    }
}
```

### Test Cache Behavior

```php
public function test_carreras_are_cached()
{
    $response = $this->get('/api/carreras');
    
    // First request hits database
    $this->assertDatabaseQueryCount(1);
    
    // Second request uses cache
    $response = $this->get('/api/carreras');
    $this->assertDatabaseQueryCount(0);
}
```

## Troubleshooting

### Cache Not Working

1. Verify cache driver is configured correctly in `.env`
2. Check if cache directory is writable (for file driver)
3. Ensure Redis/Memcached is running (for respective drivers)

### Cache Not Clearing

1. Check if cache tags are supported by your driver
2. Verify `clearModelCache()` is called after modifications
3. Use `php artisan cache:clear` to manually clear all cache

### Performance Issues

1. Monitor cache hit/miss ratio
2. Adjust TTL based on data update frequency
3. Consider using Redis with dedicated cache database

## Artisan Commands

```bash
# Clear all cache
php artisan cache:clear

# Clear specific cache store
php artisan cache:clear --store=redis

# View cache statistics (if using Laravel Telescope)
php artisan telescope:prune
```

## Environment Variables

```env
# Cache Configuration
CACHE_STORE=redis
CACHE_TTL=3600
CACHE_PREFIX=tecnm-

# Redis Configuration (if using Redis)
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
REDIS_CACHE_DB=1
```

## Migration to Other Controllers

To add caching to other controllers:

1. Add the `HasModelCache` trait
2. Implement `getModelClass()` method
3. Wrap queries in `cacheRemember()`
4. Call `clearModelCache()` after modifications

Example for `GrupoController`:

```php
class GrupoController extends Controller
{
    use HasModelCache;

    protected function getModelClass(): string
    {
        return Grupo::class;
    }

    // ... implement caching as shown above
}
```
