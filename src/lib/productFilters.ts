export type SelectedSpecFilters = Record<string, string[]>;

const normalizeList = (values: string[]) => [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));

export const parseMultiSelectParam = (value: string | null) => {
  if (!value) return [] as string[];
  return normalizeList(value.split(","));
};

export const serializeMultiSelectParam = (values: string[]) => {
  const normalized = normalizeList(values);
  return normalized.length ? normalized.join(",") : undefined;
};

export const parseSpecFiltersParam = (value: string | null): SelectedSpecFilters => {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed)
        .map(([key, entries]) => [key, normalizeList(Array.isArray(entries) ? entries.map(String) : [String(entries)])] as const)
        .filter(([key, entries]) => key.trim() && entries.length > 0),
    );
  } catch {
    return {};
  }
};

export const serializeSpecFiltersParam = (filters: SelectedSpecFilters) => {
  const normalizedEntries = Object.entries(filters)
    .map(([key, values]) => [key.trim(), normalizeList(values)] as const)
    .filter(([key, values]) => key && values.length > 0)
    .sort(([a], [b]) => a.localeCompare(b));

  if (!normalizedEntries.length) return undefined;
  return JSON.stringify(Object.fromEntries(normalizedEntries));
};

export const toggleListValue = (values: string[], value: string) => {
  return normalizeList(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
};

export const toggleSpecFilterValue = (filters: SelectedSpecFilters, specName: string, value: string): SelectedSpecFilters => {
  const currentValues = filters[specName] ?? [];
  const nextValues = toggleListValue(currentValues, value);
  const nextFilters = { ...filters };

  if (nextValues.length) nextFilters[specName] = nextValues;
  else delete nextFilters[specName];

  return nextFilters;
};

export const countSelectedSpecValues = (filters: SelectedSpecFilters) => {
  return Object.values(filters).reduce((sum, values) => sum + values.length, 0);
};
