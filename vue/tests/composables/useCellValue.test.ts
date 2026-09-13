import type { TableColumn, TableRow } from '../../src';
import { resolveMeta, useDisplayValue, useRawValue } from '../../src/composables/useCellValue';

const column = (overrides: Partial<TableColumn> = {}): TableColumn => ({
  attribute: 'name',
  label: 'Name',
  sortable: false,
  toggleable: true,
  visible: true,
  alignment: 'left',
  meta: {},
  ...overrides
});

describe('useCellValue', () => {
  it('returns row values before column defaults', () => {
    const rawValue = useRawValue(column({ defaultValue: 'Unknown' }), { name: 'Ada' });

    expect(rawValue.value).toBe('Ada');
  });

  it('uses the column default value for nullish row values', () => {
    expect(useRawValue(column({ defaultValue: 'Unknown' }), { name: null } as TableRow).value).toBe('Unknown');
    expect(useRawValue(column({ defaultValue: 'Unknown' }), {} as TableRow).value).toBe('Unknown');
  });

  it('formats display values and falls back to a dash for blank values', () => {
    expect(useDisplayValue(column(), { name: 42 }).value).toBe('42');
    expect(useDisplayValue(column(), { name: false }).value).toBe('false');
    expect(useDisplayValue(column(), { name: '' }).value).toBe('-');
    expect(useDisplayValue(column(), { name: null } as TableRow).value).toBe('-');
  });

  it('resolves metadata maps case-insensitively and ignores invalid results', () => {
    expect(resolveMeta({ active: 'green', Pending: 'amber' }, 'Active')).toBe('green');
    expect(resolveMeta({ Pending: 'amber' }, 'Pending')).toBe('amber');
    expect(resolveMeta({ active: 1 }, 'active')).toBeUndefined();
    expect(resolveMeta(['green'], 'active')).toBeUndefined();
    expect(resolveMeta(null, 'active')).toBeUndefined();
  });
});