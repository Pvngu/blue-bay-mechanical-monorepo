export interface FilterOption {
  label: string;
  value: string | number;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: 'search' | 'multiselect' | 'dynamic-multiselect';
  options?: FilterOption[];

  resource?: string; // For dynamic-multiselect
  optionLabelKey?: string;
  optionValueKey?: string;
}