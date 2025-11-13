import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { FormFieldConfig } from "@/types/form";
import { FilterConfig } from "@/types/filters";

export type Grupo = {
  id: number;
  materia: { id: number; nombre: string } | null;
  profesor?: { id: number; nombre: string } | null;
  periodo: { id: number; nombre: string } | null;
  carrera?: { id: number; nombre: string } | null;
  horario?: string | null;
  aula?: string | null;
};

export const GrupoIncludes = ["materia", "profesor", "periodo", "carrera"];

export const GrupoFilters: FilterConfig[] = [
  {
    id: "aula",
    label: "Buscar por aula...",
    type: "search",
  },
  {
    id: "materia_id",
    label: "Materia",
    type: "dynamic-multiselect",
    resource: "materias",
    optionLabelKey: "nombre",
    optionValueKey: "id",
  },
  {
    id: "profesor_id",
    label: "Profesor",
    type: "dynamic-multiselect",
    resource: "profesores",
    optionLabelKey: "nombre",
    optionValueKey: "id",
  },
  {
    id: "periodo_id",
    label: "Periodo",
    type: "dynamic-multiselect",
    resource: "periodos",
    optionLabelKey: "nombre",
    optionValueKey: "id",
  },
  {
    id: "carrera_id",
    label: "Carrera",
    type: "multiselect",
    options: [
      { label: "Ingeniería en Sistemas", value: 1 },
      { label: "Ingeniería Industrial", value: 2 },
      { label: "Ingeniería Civil", value: 3 },
    ],
  },
];

export const GrupoSchema = z.object({
  id: z.number().optional().nullable(),
  materia_id: z
    .number({ message: "La materia es requerida" })
    .min(1, "La materia es requerida"),
  profesor_id: z
    .number({ message: "El profesor es requerido" })
    .min(1, "El profesor es requerido"),
  periodo_id: z
    .number({ message: "El periodo es requerido" })
    .min(1, "El periodo es requerido"),
  carrera_id: z.number().optional().nullable(),
  horario: z.string().optional().nullable(),
  aula: z.string().optional().nullable(),
});

export const GrupoColumns: ColumnDef<Grupo>[] = [
  { accessorKey: "id", header: "ID" },
  {
    accessorKey: "materia_id",
    header: "Materia",
    accessorFn: (row) => row?.materia?.nombre,
  },
  {
    accessorKey: "profesor_id",
    header: "Profesor",
    accessorFn: (row) => row?.profesor?.nombre,
  },
  {
    accessorKey: "periodo_id",
    header: "Periodo",
    accessorFn: (row) => row?.periodo?.nombre,
  },
  {
    accessorKey: "carrera_id",
    header: "Carrera",
    accessorFn: (row) => row?.carrera?.nombre,
  },
  { accessorKey: "horario", header: "Horario" },
  { accessorKey: "aula", header: "Aula" },
];

export const GrupoFormConfig: FormFieldConfig[] = [
  {
    name: "materia_id",
    label: "Materia",
    type: "dynamic-select",
    placeholder: "Selecionar Materia",
    resource: "materias",
    optionLabelKey: "nombre",
    optionValueKey: "id",
    columns: {
      container: 6,
      label: 12,
      wrapper: 12,
    },
  },
  {
    name: "profesor_id",
    label: "Profesor",
    type: "dynamic-select",
    placeholder: "Seleccionar Profesor",
    resource: "profesores",
    optionLabelKey: "nombre",
    optionValueKey: "id",
    columns: {
      container: 6,
      label: 12,
      wrapper: 12,
    },
  },
  {
    name: "periodo_id",
    label: "Periodo",
    type: "dynamic-select",
    placeholder: "Seleccionar Periodo",
    resource: "periodos",
    optionLabelKey: "nombre",
    optionValueKey: "id",
    columns: {
      container: 6,
      label: 12,
      wrapper: 12,
    },
  },
  {
    name: "carrera_id",
    label: "Seleccionar Carrera",
    type: "dynamic-select",
    placeholder: "Carrera (opcional)",
    resource: "carreras",
    optionLabelKey: "nombre",
    optionValueKey: "id",
    columns: {
      container: 6,
      label: 12,
      wrapper: 12,
    },
  },
  {
    name: "horario",
    label: "Horario",
    type: "text",
    placeholder: "Horario (ej. Lun 8:00-10:00)",
  },
  {
    name: "aula",
    label: "Aula",
    type: "text",
    placeholder: "Aula (opcional)",
  },
];

// Función para crear las acciones personalizadas con acceso al router
export const createGrupoCustomActions = (router: any) => [
  {
    label: "Ver Grupo y Asistencia",
    onClick: (row: Grupo) => {
      router.push(`/admin/grupos/${row.id}`);
    },
  },
];
