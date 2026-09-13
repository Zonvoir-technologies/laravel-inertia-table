import { router } from '@inertiajs/vue3';
import { visitUrl } from '../../src';

describe('visitUrl', () => {
  beforeEach(() => {
    vi.mocked(router.visit).mockReset();
  });

  it('visits URLs with table-friendly defaults', () => {
    visitUrl('/users');

    expect(router.visit).toHaveBeenCalledWith('/users', {
      preserveState: true,
      preserveScroll: true
    });
  });

  it('allows callers to override defaults and pass Inertia options', () => {
    visitUrl('/users/1', {
      method: 'delete',
      data: { reason: 'duplicate' },
      preserveState: false,
      preserveScroll: false,
      only: ['users'],
      replace: true
    });

    expect(router.visit).toHaveBeenCalledWith('/users/1', {
      preserveState: false,
      preserveScroll: false,
      method: 'delete',
      data: { reason: 'duplicate' },
      only: ['users'],
      replace: true
    });
  });
});