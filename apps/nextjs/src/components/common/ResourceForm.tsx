'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormFieldConfig } from '@/types/form';
import { UseMutationResult } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    MultiSelect,
    MultiSelectTrigger,
    MultiSelectValue,
    MultiSelectContent,
    MultiSelectItem,
} from '@/components/ui/multi-select';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DynamicSelect } from '@/components/common/DynamicSelect';
import { DynamicMultiSelect } from '@/components/common/DynamicMultiSelect';
import { PhotoUploadField } from '@/components/common/PhotoUploadField';

interface ResourceFormProps<T extends z.ZodTypeAny> {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    // Accept any zod schema (ZodTypeAny) for flexibility across resource configs
    schema: T | z.ZodTypeAny;
    formConfig: FormFieldConfig[];
    onSubmit: UseMutationResult<any, any, any, any>;
    defaultValues?: any;
    isLoadingData: boolean;
    isEditMode: boolean;
}

export function ResourceForm<T extends z.ZodTypeAny>({
    isOpen,
    onOpenChange,
    schema,
    formConfig,
    onSubmit,
    defaultValues,
    isLoadingData,
    isEditMode,
}: ResourceFormProps<T>) {
    // Use a permissive any for the form values to avoid tight coupling between Zod generics
    // and react-hook-form's FieldValues generic. This keeps the component flexible while
    // still using zod for runtime validation via the resolver.
    const form = useForm<any>({
    // Cast the zod resolver to react-hook-form's Resolver<any> to satisfy TS
    resolver: (zodResolver(schema as any) as unknown) as Resolver<any>,
        defaultValues: defaultValues || {},
    });

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && defaultValues) {
                // Process date fields to ensure they're in the correct format (YYYY-MM-DD)
                const processedValues = { ...defaultValues };
                
                // Find all date-type fields in formConfig
                formConfig.forEach(config => {
                    if ((config.type === 'date' || config.type === 'datetime') && processedValues[config.name]) {
                        const dateValue = processedValues[config.name];
                        
                        if (config.type === 'date') {
                            // For date inputs, extract just the date part (YYYY-MM-DD)
                            processedValues[config.name] = dateValue.split('T')[0];
                        } else if (config.type === 'datetime') {
                            // For datetime-local inputs, format as YYYY-MM-DDTHH:mm
                            const date = new Date(dateValue);
                            if (!isNaN(date.getTime())) {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                const hours = String(date.getHours()).padStart(2, '0');
                                const minutes = String(date.getMinutes()).padStart(2, '0');
                                processedValues[config.name] = `${year}-${month}-${day}T${hours}:${minutes}`;
                            }
                        }
                    }
                });
                
                form.reset(processedValues);
            } else {
                // Reset to empty values for create mode
                form.reset({} as any);
            }
        }
    }, [isOpen, isEditMode, defaultValues, formConfig]);

    const handleFormSubmit = (data: any) => {
        console.log('Submitting form data:', data);
        onSubmit.mutate(data, {
            onSuccess: () => {
                console.log('Form submitted successfully');
                onOpenChange(false);
                form.reset();
            }
        });
    }

    const renderField = (field: any, config: FormFieldConfig) => {
        // Handle dynamic fields first with type guards
        if (config.type === 'dynamic-select') {
            return (
                <DynamicSelect
                    resource={config.resource}
                    optionLabelKey={config.optionLabelKey}
                    optionValueKey={config.optionValueKey}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={config.placeholder}
                />
            );
        }

        if (config.type === 'dynamic-multiselect') {
            return (
                <DynamicMultiSelect
                    resource={config.resource}
                    optionLabelKey={config.optionLabelKey}
                    optionValueKey={config.optionValueKey}
                    values={field.value || []}
                    onValuesChange={field.onChange}
                    placeholder={config.placeholder}
                />
            );
        }

        // Now TypeScript knows config is StaticField
        switch(config.type) {
            case 'text':
            case 'email':
            case 'password':
                return (
                    <Input 
                        type={config.type}
                        placeholder={config.placeholder} 
                        {...field}
                        value={field.value ?? ''}
                    />
                );
            
            case 'number':
                return (
                    <Input 
                        type="number"
                        placeholder={config.placeholder}
                        min={config.min}
                        max={config.max}
                        step={config.step}
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                );
            
            case 'textarea':
                return (
                    <Textarea 
                        placeholder={config.placeholder}
                        rows={config.rows || 4}
                        {...field}
                        value={field.value ?? ''}
                    />
                );
            
            case 'checkbox':
                return (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                        {config.description && (
                            <span className="text-sm text-muted-foreground">
                                {config.description}
                            </span>
                        )}
                    </div>
                );
            
            case 'select':
                const SelectField = () => {
                    const [open, setOpen] = useState(false);
                    const selectedOption = config.options?.find(
                        opt => opt.value.toString() === field.value?.toString()
                    );

                    return (
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between font-normal"
                                >
                                    {selectedOption ? selectedOption.label : (config.placeholder || 'Selecciona una opción')}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                    <CommandInput placeholder={`Buscar ${config.label.toLowerCase()}...`} />
                                    <CommandList>
                                        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                                        <CommandGroup>
                                            {config.options?.map((option) => (
                                                <CommandItem
                                                    key={option.value.toString()}
                                                    value={option.label}
                                                    onSelect={() => {
                                                        const newValue = typeof option.value === 'number' 
                                                            ? option.value 
                                                            : option.value;
                                                        field.onChange(newValue);
                                                        setOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            field.value?.toString() === option.value.toString()
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                        )}
                                                    />
                                                    {option.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    );
                };
                return <SelectField />;
            
            case 'multiselect':
                return (
                    <MultiSelect
                        values={field.value || []}
                        onValuesChange={(values) => {
                            // Convert to numbers if needed
                            const option = config.options?.[0];
                            if (option && typeof option.value === 'number') {
                                field.onChange(values.map(v => Number(v)));
                            } else {
                                field.onChange(values);
                            }
                        }}
                    >
                        <MultiSelectTrigger className='w-full'>
                            <MultiSelectValue placeholder={config.placeholder || 'Selecciona opciones'} />
                        </MultiSelectTrigger>
                        <MultiSelectContent>
                            {config.options?.map((option) => (
                                <MultiSelectItem 
                                    key={option.value.toString()} 
                                    value={option.value.toString()}
                                >
                                    {option.label}
                                </MultiSelectItem>
                            ))}
                        </MultiSelectContent>
                    </MultiSelect>
                );
            
            case 'radio':
                return (
                    <RadioGroup
                        value={field.value?.toString()}
                        onValueChange={(value: string) => {
                            const option = config.options?.find(opt => opt.value.toString() === value);
                            field.onChange(typeof option?.value === 'number' ? Number(value) : value);
                        }}
                    >
                        {config.options?.map((option) => (
                            <div key={option.value.toString()} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value.toString()} id={`${config.name}-${option.value}`} />
                                <label 
                                    htmlFor={`${config.name}-${option.value}`}
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    {option.label}
                                </label>
                            </div>
                        ))}
                    </RadioGroup>
                );
            
            case 'date':
                return (
                    <Input 
                        type="date"
                        placeholder={config.placeholder}
                        {...field}
                        value={field.value ?? ''}
                    />
                );
            
            case 'time':
                return (
                    <Input 
                        type="time"
                        placeholder={config.placeholder}
                        {...field}
                        value={field.value ?? ''}
                    />
                );
            
            case 'datetime':
                return (
                    <Input 
                        type="datetime-local"
                        placeholder={config.placeholder}
                        {...field}
                        value={field.value ?? ''}
                    />
                );
            
            case 'file':
                // Use PhotoUploadField for better UX with previews
                if (config.accept?.includes('image') || config.multiple) {
                    return (
                        <PhotoUploadField
                            value={field.value || []}
                            onChange={field.onChange}
                            label=""
                            description={config.description}
                        />
                    );
                }
                // Fallback to regular file input for non-image files
                return (
                    <Input 
                        type="file"
                        accept={config.accept}
                        multiple={config.multiple}
                        onChange={(e) => {
                            const files = e.target.files;
                            if (files) {
                                field.onChange(config.multiple ? Array.from(files) : files[0]);
                            }
                        }}
                    />
                );
            
            default:
                return (
                    <Input 
                        type="text"
                        placeholder={config.placeholder} 
                        {...field}
                    />
                );
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                    <SheetHeader>
                        <SheetTitle>
                            {isEditMode ? 'Editar Registro' : 'Crear Nuevo Registro'}
                        </SheetTitle>
                        <SheetDescription>
                            Completa los campos y guarda los cambios.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 px-4 space-y-4">
                    {isLoadingData ? (
                        formConfig.map((config) => (
                            <div key={config.name} className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))
                    ) : (
                        <div className="grid grid-cols-12 gap-4">
                        {formConfig.map((config) => {
                            const containerCols = config.columns?.container || 12;
                            const labelCols = config.columns?.label;
                            const wrapperCols = config.columns?.wrapper;
                            
                            // Map column numbers to Tailwind classes
                            const getColSpanClass = (cols: number) => {
                                const colMap: Record<number, string> = {
                                    1: 'col-span-1',
                                    2: 'col-span-2',
                                    3: 'col-span-3',
                                    4: 'col-span-4',
                                    5: 'col-span-5',
                                    6: 'col-span-6',
                                    7: 'col-span-7',
                                    8: 'col-span-8',
                                    9: 'col-span-9',
                                    10: 'col-span-10',
                                    11: 'col-span-11',
                                    12: 'col-span-12',
                                };
                                return colMap[Math.min(cols, 12)] || 'col-span-12';
                            };
                            
                            return (
                            <div 
                                key={config.name} 
                                className={getColSpanClass(containerCols)}
                            >
                                <FormField
                                    control={form.control as any}
                                    name={config.name as any}
                                    render={({ field }) => (
                                    <FormItem>
                                        {labelCols && wrapperCols ? (
                                            <div className="grid grid-cols-12 gap-2 items-center">
                                                <FormLabel className={getColSpanClass(labelCols)}>
                                                    {config.label}
                                                </FormLabel>
                                                <div className={getColSpanClass(wrapperCols)}>
                                                    <FormControl>
                                                        {renderField(field, config)}
                                                    </FormControl>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <FormLabel>{config.label}</FormLabel>
                                                <FormControl>
                                                    {renderField(field, config)}
                                                </FormControl>
                                            </>
                                        )}
                                        {config.description && config.type !== 'checkbox' && (
                                            <FormDescription>{config.description}</FormDescription>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                            );
                        })}
                        </div>
                    )}
                    </div>
                    <SheetFooter>
                    <SheetClose asChild>
                        <Button type="button" variant="outline">
                        Cancelar
                        </Button>
                    </SheetClose>
                    <Button type="submit" disabled={onSubmit.isPending || isLoadingData}>
                        {onSubmit.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Guardar Cambios
                    </Button>
                    </SheetFooter>
                </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}