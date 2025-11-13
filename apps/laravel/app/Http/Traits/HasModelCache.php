<?php

namespace App\Http\Traits;

use Illuminate\Support\Facades\Cache;

trait HasModelCache
{
    /**
     * Get the cache key prefix for the model.
     */
    protected function getCachePrefix(): string
    {
        return strtolower(class_basename($this->getModelClass()));
    }

    /**
     * Get the model class name.
     */
    protected function getModelClass(): string
    {
        // Override this method in your controller if needed
        return '';
    }

    /**
     * Get cache tags for the model.
     */
    protected function getCacheTags(): array
    {
        return [$this->getCachePrefix()];
    }

    /**
     * Get cache key for a specific item.
     */
    protected function getCacheKey(string $suffix): string
    {
        return $this->getCachePrefix() . ':' . $suffix;
    }

    /**
     * Get cache TTL in seconds (default: 1 hour).
     */
    protected function getCacheTTL(): int
    {
        return config('cache.ttl', 3600);
    }

    /**
     * Clear all cache for this model.
     */
    protected function clearModelCache(): void
    {
        if ($this->supportsCacheTags()) {
            Cache::tags($this->getCacheTags())->flush();
        } else {
            // For cache drivers that don't support tags (like file or database)
            Cache::flush();
        }
    }

    /**
     * Check if the cache driver supports tags.
     */
    protected function supportsCacheTags(): bool
    {
        $driver = config('cache.default');
        return in_array($driver, ['redis', 'memcached', 'array']);
    }

    /**
     * Remember a value in cache.
     */
    protected function cacheRemember(string $key, callable $callback)
    {
        $cacheKey = $this->getCacheKey($key);
        
        if ($this->supportsCacheTags()) {
            return Cache::tags($this->getCacheTags())
                ->remember($cacheKey, $this->getCacheTTL(), $callback);
        }
        
        return Cache::remember($cacheKey, $this->getCacheTTL(), $callback);
    }
}
