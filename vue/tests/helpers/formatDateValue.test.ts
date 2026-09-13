import type { TableColumn } from '../../src';
import { formatDateValue } from '../../src/helpers/formatDateValue';

const column = (meta: TableColumn['meta'] = {}): TableColumn => ({
  attribute: 'published_at',
  label: 'Published at',
  sortable: false,
  toggleable: true,
  visible: true,
  alignment: 'left',
  meta
});

describe('formatDateValue', () => {
  it('formats date-only values without applying a timezone', () => {
    expect(formatDateValue(column({ format: 'Y/m/d' }), '2025-03-04', true)).toBe('2025/03/04');
  });

  it('formats date-time values using the configured timezone', () => {
    expect(formatDateValue(column({ format: 'Y-m-d H:i:s', timezone: 'UTC' }), '2025-03-04T15:06:07Z')).toBe('2025-03-04 15:06:07');
  });

  it('uses the placeholder for blank values and preserves invalid values', () => {
    expect(formatDateValue(column({ placeholder: 'Not set' }), null)).toBe('Not set');
    expect(formatDateValue(column({ placeholder: 'Not set' }), '')).toBe('Not set');
    expect(formatDateValue(column(), 'not-a-date')).toBe('not-a-date');
  });
  it('supports Date and timestamp values plus named format tokens', () => {
    const meta = { format: 'yyyy yy Y y MMMM MMM F M MM m n dd d j HH H G hh h g mm i ss s A a', timezone: 'UTC' };
    const formatted = formatDateValue(column(meta), new Date('2025-03-04T15:06:07Z'));

    expect(formatted).toContain('2025 25 2025 25 March Mar March Mar 03 03 3 04 04 4 15 15 15 03 03 3 06 06 07 07 PM pm');
    expect(formatDateValue(column({ format: 'Y-m-d', timezone: 'UTC' }), 1741100767000)).toBe('2025-03-04');
  });

  it('falls back for invalid Date objects and non-date values', () => {
    expect(formatDateValue(column(), new Date('invalid'))).toBe('Invalid Date');
    expect(formatDateValue(column(), { unexpected: true } as never)).toBe('[object Object]');
  });
});