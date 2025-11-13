export type ColumnLayout = {
  container?: number; // Max 12
  label?: number; // Max 12
  wrapper?: number; // Max 12
};

export type CommonFieldProps = {
  name: string;
  label: string;
  placeholder?: string;
  // Additional properties
  description?: string;
  rows?: number; // For textarea
  accept?: string; // For file input
  multiple?: boolean; // For file input or multiselect
  min?: number; // For number input
  max?: number; // For number input
  step?: number; // For number input
  columns?: ColumnLayout; // Optional column layout
};

export type StaticFieldTypes =
  | "text"
  | "number"
  | "email"
  | "password"
  | "select"
  | "multiselect"
  | "textarea"
  | "checkbox"
  | "radio"
  | "date"
  | "time"
  | "datetime"
  | "file";

export type DynamicFieldTypes = "dynamic-select" | "dynamic-multiselect";

export type SelectOption = { label: string; value: string | number };

// Dynamic select(s) must have resource and option keys
export type DynamicSelectField = CommonFieldProps & {
  type: DynamicFieldTypes;
  resource: string;
  optionLabelKey: string;
  optionValueKey: string;
  options?: SelectOption[]; // allow override/fallback if desired
};

// Non-dynamic fields keep options optional (for select/multiselect)
export type StaticField = CommonFieldProps & {
  type: StaticFieldTypes;
  options?: SelectOption[];
};

export type FormFieldConfig = DynamicSelectField | StaticField;