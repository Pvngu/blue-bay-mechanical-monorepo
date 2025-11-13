'use client';

import { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { apiService } from '@/services/apiService';

import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectItem,
} from '@/components/ui/multi-select';
import { Loader2 } from 'lucide-react';

interface DynamicMultiSelectProps {
  resource: string;
  optionLabelKey?: string;
  optionValueKey?: string;
  values?: (string | number)[];
  onValuesChange: (values: (string | number)[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DynamicMultiSelect({
  resource,
  optionLabelKey = 'label',
  optionValueKey = 'value',
  values = [],
  onValuesChange,
  placeholder = 'Selecciona opciones',
  disabled = false,
}: DynamicMultiSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['resource-options', resource, optionLabelKey, debouncedSearchTerm],
    queryFn: ({ pageParam = 1 }) =>
      apiService.getList(resource, {
        page: pageParam,
        per_page: 100,
        filter: { [optionLabelKey]: debouncedSearchTerm || undefined },
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    enabled: true, // Always enabled to load initial data
    initialPageParam: 1,
  });

  const options = data?.pages.flatMap((page) => page.data) ?? [];

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Convert values to string for the MultiSelect component
  const stringValues = values.map(v => String(v));

  const handleValuesChange = (newStringValues: string[]) => {
    // Determine if we should convert back to numbers
    const firstOption = options[0] as any;
    if (firstOption && typeof firstOption[optionValueKey] === 'number') {
      onValuesChange(newStringValues.map(v => Number(v)));
    } else {
      onValuesChange(newStringValues);
    }
  };

  return (
    <MultiSelect 
      values={stringValues} 
      onValuesChange={handleValuesChange}
    >
      <MultiSelectTrigger className='w-full' disabled={disabled}>
        <MultiSelectValue placeholder={placeholder} />
      </MultiSelectTrigger>
      <MultiSelectContent 
        search={{ 
          placeholder: 'Buscar...', 
          emptyMessage: 'No se encontraron resultados.' 
        }}
      >
        {isLoading && !data && (
          <div className="p-2 flex justify-center items-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
        {options.map((option: any) => (
          <MultiSelectItem
            key={String(option[optionValueKey])}
            value={String(option[optionValueKey])}
            badgeLabel={option[optionLabelKey]}
          >
            {option[optionLabelKey]}
          </MultiSelectItem>
        ))}
        {hasNextPage && (
          <div ref={loadMoreRef} className="p-2 flex justify-center items-center">
            {isFetchingNextPage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="text-xs text-muted-foreground">Cargar más...</span>
            )}
          </div>
        )}
      </MultiSelectContent>
    </MultiSelect>
  );
}
