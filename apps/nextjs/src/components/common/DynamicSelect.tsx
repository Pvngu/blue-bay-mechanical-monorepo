'use client';

import { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { apiService } from '@/services/apiService';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ChevronsUpDown, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DynamicSelectProps {
  resource: string;
  optionLabelKey?: string;
  optionValueKey?: string;
  value?: string | number | null;
  onValueChange: (value: string | number | null) => void;
  placeholder?: string;
  disabled?: boolean;
  customLabel?: (option: any) => string;
  searchKey?: string;
}

export function DynamicSelect({
  resource,
  optionLabelKey = 'label',
  optionValueKey = 'value',
  value,
  onValueChange,
  placeholder = 'Selecciona una opción',
  disabled = false,
  customLabel,
  searchKey,
}: DynamicSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const effectiveSearchKey = searchKey || optionLabelKey;

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['resource-options', resource, effectiveSearchKey, debouncedSearchTerm],
    queryFn: ({ pageParam = 1 }) =>
      apiService.getList(resource, {
        page: pageParam,
        per_page: 100,
        filter: { [effectiveSearchKey]: debouncedSearchTerm || undefined },
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    enabled: open,
    initialPageParam: 1,
  });

  const options = data?.pages.flatMap((page) => page.data) ?? [];

  const selectedOption = options.find(
    (opt: any) => opt[optionValueKey]?.toString() === value?.toString()
  ) as any;

  const getOptionLabel = (option: any) => {
    if (customLabel) {
      return customLabel(option);
    }
    return option[optionLabelKey];
  };

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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          {selectedOption
            ? getOptionLabel(selectedOption)
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Buscar...`}
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {isLoading && !data && (
              <div className="p-2 flex justify-center items-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            {!isLoading && options.length === 0 && (
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            )}
            <CommandGroup>
              {options.map((option: any) => {
                const optValue = option[optionValueKey];
                const isSelected = optValue?.toString() === value?.toString();
                return (
                  <CommandItem
                    key={String(optValue)}
                    onSelect={() => {
                      onValueChange(isSelected ? null : optValue);
                      setOpen(false);
                    }}
                    className="flex items-center"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {getOptionLabel(option)}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {hasNextPage && (
              <div ref={loadMoreRef} className="p-2 flex justify-center items-center">
                {isFetchingNextPage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Load More'
                )}
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
