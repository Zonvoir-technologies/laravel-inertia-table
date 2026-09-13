import * as library from '../src';

describe('public API', () => {
  it('exports the documented runtime entry points', () => {
    expect(library.Table).toBe(library.ZonvoirTable);
    expect(library.useTable).toBeTypeOf('function');
    expect(library.useActions).toBeTypeOf('function');
    expect(library.normalizeTable).toBeTypeOf('function');
    expect(library.visitUrl).toBeTypeOf('function');
    expect(library.configureTable).toBeTypeOf('function');
    expect(library.resetTableConfiguration).toBeTypeOf('function');
  });
});
