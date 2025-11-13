<?php

namespace App\Http\Traits;

use Illuminate\Http\Request;

trait HasPagination
{
    /**
     * Get the page size from the request with validation.
     *
     * @param Request|null $request
     * @return int
     */
    protected function getPageSize(?Request $request = null): int
    {
        $request = $request ?? request();
        
        $pageSize = $request->input('per_page', config('app.pagination.default', 10));
        
        // Convert to integer
        $pageSize = (int) $pageSize;
        
        // Validate bounds
        $minSize = config('app.pagination.min', 1);
        $maxSize = config('app.pagination.max', 100);
        
        return max($minSize, min($pageSize, $maxSize));
    }
}
