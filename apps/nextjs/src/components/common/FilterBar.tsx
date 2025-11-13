'use client';

import { FilterConfig } from "@/types/filters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { QueryParams } from "@/hooks/useResource";
import { useDebouncedCallback } from 'use-debounce';
import { DynamicFilterSelect } from "./FilterSelect";
import { DynamicFilterMultiSelect } from "./DynamicFilterMultiSelect";

interface FilterBarProps {
    config: FilterConfig[];
    queryParams: QueryParams;
    setQueryParams: React.Dispatch<React.SetStateAction<QueryParams>>;
}

export function FilterBar({ config, queryParams, setQueryParams }: FilterBarProps) {
    const filters = queryParams.filter || {};

    const debouncedSearch = useDebouncedCallback((id: string, value: string) => {
        setQueryParams((prev) => ({
            ...prev,
            page: 1,
            filter: {
                ...prev.filter,
                [id]: value || undefined,
            }
        }));
    }, 300);

    const resetFilters = () => {
        setQueryParams((prev) => ({
            ...prev,
            page: 1,
            filter: {},
        }));
    };

    // --- RENDER ---
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        {config.map((item) => {
          if (item.type === 'search') {
            return (
              <Input
                key={item.id}
                placeholder={item.label}
                defaultValue={filters[item.id] || ''}
                onChange={(e) => debouncedSearch(item.id, e.target.value)}
                className="max-w-xs"
              />
            );
          }
          if (item.type === 'multiselect') {
            return (
              <DynamicFilterSelect
                key={item.id}
                config={item}
                queryParams={queryParams}
                setQueryParams={setQueryParams}
              />
            );
          }
          if (item.type === 'dynamic-multiselect') {
            return (
              <DynamicFilterMultiSelect
                key={item.id}
                config={item}
                queryParams={queryParams}
                setQueryParams={setQueryParams}
              />
            );
          }
          return null;
        })}
        {Object.keys(filters).length > 0 && (
           <Button variant="ghost" size="sm" onClick={resetFilters}>
             <X className="h-4 w-4 mr-1" />
             Reset
           </Button>
        )}
      </div>
    </div>
  );
}