'use client';

import { useState } from 'react';
import { FilterConfig } from '@/types/filters';
import { QueryParams } from '@/hooks/useResource';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { CirclePlus, CircleMinus } from 'lucide-react';

interface DynamicFilterSelectProps {
  config: FilterConfig;
  queryParams: QueryParams;
  setQueryParams: React.Dispatch<React.SetStateAction<QueryParams>>;
}

export function DynamicFilterSelect({ config, queryParams, setQueryParams }: DynamicFilterSelectProps) {
  const { 
    id: filterId, 
    label, 
    options: staticOptions,
    optionLabelKey = 'label',
    optionValueKey = 'value'
  } = config;
  
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedValues = new Set<string | number>(queryParams.filter?.[filterId] || []);

  // Use static options only (for non-dynamic filters)
  const options = staticOptions || [];

  const filteredOptions = options.filter((opt: any) =>
    opt[optionLabelKey].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (value: string | number, checked: boolean) => {
    const newSelectedValues = new Set(selectedValues);

    if (checked) {
      newSelectedValues.add(value);
    } else {
      newSelectedValues.delete(value);
    }

    const newValuesArray = Array.from(newSelectedValues);
    setQueryParams((prev) => ({
      ...prev,
      page: 1,
      filter: {
        ...prev.filter,
        [filterId]: newValuesArray.length > 0 ? newValuesArray : undefined,
      },
    }));
  };

  const clearSelection = () => {
    setQueryParams((prev) => ({
      ...prev,
      page: 1,
      filter: {
        ...prev.filter,
        [filterId]: undefined,
      },
    }));
    setOpen(false);
  };

  const selectedItems = filteredOptions.filter((opt: any) =>
    selectedValues.has(opt[optionValueKey])
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 justify-start border" style={{borderStyle: "dashed"}}>
          {selectedValues.size === 0 ? <CirclePlus className="h-4 w-4 ml-auto" /> : <CircleMinus className="h-4 w-4 ml-auto" />}
          <span>{label}</span>
          {selectedItems.length > 0 && selectedItems.length <= 2 && (
            <>
              <Separator orientation="vertical" />
              {selectedItems.map((opt: any) => (
                <Badge key={String(opt[optionValueKey])} variant="secondary" className="font-normal">
                  {opt[optionLabelKey]}
                </Badge>
              ))}
            </>
          )}
          {selectedItems.length > 2 && (
            <Badge variant="secondary" className="font-normal">
              {selectedItems.length} selected
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Buscar ${label.toLowerCase()}...`}
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {filteredOptions.length === 0 && (
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            )}
            <CommandGroup>
              {filteredOptions.map((option: any) => {
                const value = option[optionValueKey];
                const isSelected = selectedValues.has(value);
                return (
                  <CommandItem
                    key={String(value)}
                    onSelect={() => handleSelect(value, !isSelected)}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked: boolean) => handleSelect(value, checked)}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    />
                    <span className="flex-1">{option[optionLabelKey]}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        
        {selectedValues.size > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="w-full"
            >
              Clear selection
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}