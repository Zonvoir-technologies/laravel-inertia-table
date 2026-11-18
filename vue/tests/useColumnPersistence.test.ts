import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useColumnPersistence } from '../src/composables/useColumnPersistence';

describe('useColumnPersistence', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    vi.useFakeTimers();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.useRealTimers();
  });

  it('persists column order to the endpoint with debounce', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    global.fetch = fetchMock;

    const { persistColumnOrder, isSaving } = useColumnPersistence({
      tableName: 'users-table',
      endpoint: '/zonvoir-table/preferences',
      debounceMs: 100,
    });

    const promise = persistColumnOrder(['name', 'email', 'status']);
    expect(isSaving.value).toBe(false);

    vi.advanceTimersByTime(100);
    const result = await promise;

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/zonvoir-table/preferences',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          table: 'users-table',
          columns: ['name', 'email', 'status'],
        }),
      })
    );
  });

  it('debounces rapid persistence calls', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    global.fetch = fetchMock;

    const { persistColumnOrder } = useColumnPersistence({
      tableName: 'orders-table',
      debounceMs: 200,
    });

    persistColumnOrder(['id', 'amount']);
    vi.advanceTimersByTime(100);
    const promise2 = persistColumnOrder(['amount', 'id', 'date']);
    vi.advanceTimersByTime(200);

    await promise2;

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/zonvoir-table/preferences',
      expect.objectContaining({
        body: JSON.stringify({
          table: 'orders-table',
          columns: ['amount', 'id', 'date'],
        }),
      })
    );
  });

  it('resets column preferences using delete request', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    global.fetch = fetchMock;

    const { resetColumnOrder } = useColumnPersistence({
      tableName: 'users-table',
      resetEndpoint: '/zonvoir-table/preferences/reset',
    });

    const result = await resetColumnOrder();

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/zonvoir-table/preferences/reset',
      expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({
          table: 'users-table',
        }),
      })
    );
  });
});
