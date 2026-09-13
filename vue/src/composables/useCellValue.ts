import { computed, type ComputedRef } from 'vue';
import type { TableCellValue, TableColumn, TableMetaValue, TableRow } from '../types/table';

export function useRawValue(column: TableColumn, row: TableRow): ComputedRef<TableCellValue> {
  return computed((): TableCellValue => (row[column.attribute] ?? column.defaultValue) as TableCellValue);
}

export function useDisplayValue(column: TableColumn, row: TableRow): ComputedRef<string> {
  const rawValue: ComputedRef<TableCellValue> = useRawValue(column, row);

  return computed((): string => {
    const value: TableCellValue = rawValue.value;

    if (value === null || value === undefined || value === '') {
      return '-';
    }

    return String(value);
  });
}

export function resolveMeta(map: TableMetaValue, value: string): string | undefined {
  if (!map || typeof map !== 'object' || Array.isArray(map) || map instanceof Date) {
    return undefined;
  }

  const result = map[value.toLowerCase()] ?? map[value];

  return typeof result === 'string' ? result : undefined;
}