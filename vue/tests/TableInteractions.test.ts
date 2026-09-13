import { DOMWrapper, mount } from '@vue/test-utils';
import { router } from '@inertiajs/vue3';
import { nextTick } from 'vue';
import { vi } from 'vitest';
import { normalizeTable, Table } from '../src';
import { installTableTestHooks } from './tableTestUtils';

installTableTestHooks();

describe('Table Interactions', () => {
  it('emits row and cell click events', async () => {
    const table = normalizeTable({
      name: 'Users',
      columns: [{ attribute: 'name', label: 'Name' }],
      rows: [{ id: 1, name: 'Ada' }]
    });

    const wrapper = mount(Table, {
      props: {
        table
      }
    });

    await wrapper.find('tbody td[data-column="name"]').trigger('click');

    expect(wrapper.emitted('cell-click')?.[0]?.[0]).toMatchObject({
      row: { id: 1, name: 'Ada' },
      column: { attribute: 'name' },
      value: 'Ada'
    });
    expect(wrapper.emitted('row-click')?.[0]?.[0]).toMatchObject({ id: 1, name: 'Ada' });
    expect(wrapper.emitted('row-click')?.[0]?.[1]).toMatchObject({ attribute: 'name' });
  });

  it('renders backend column URLs as links and visits same-tab links', async () => {
    const wrapper = mount(Table, {
      props: {
        table: {
          name: 'Users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [
            {
              id: 1,
              name: 'Ada',
              _column_urls: {
                name: '/users/1/edit'
              }
            }
          ]
        }
      }
    });

    const link = wrapper.find('tbody td[data-column="name"] a');

    expect(link.attributes('href')).toBe('/users/1/edit');

    await link.trigger('click');

    expect(router.visit).toHaveBeenCalledWith('/users/1/edit', expect.objectContaining({
      preserveScroll: true,
      preserveState: true
    }));
    expect(wrapper.emitted('cell-click')?.[0]?.[0]).toMatchObject({
      row: { id: 1, name: 'Ada' },
      column: { attribute: 'name' },
      value: 'Ada'
    });
  });

  it('renders new-tab column URLs without intercepting navigation', async () => {
    const wrapper = mount(Table, {
      props: {
        table: {
          name: 'Users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [
            {
              id: 1,
              name: 'Ada',
              _column_urls: {
                name: { url: '/users/1/edit', target: '_blank' }
              }
            }
          ]
        }
      }
    });

    const link = wrapper.find('tbody td[data-column="name"] a');

    expect(link.attributes('target')).toBe('_blank');
    expect(link.attributes('rel')).toBe('noopener noreferrer');

    await link.trigger('click');

    expect(router.visit).not.toHaveBeenCalled();
  });

  it('visits row URLs when no custom row-click listener is registered', async () => {
    const wrapper = mount(Table, {
      props: {
        table: {
          name: 'Users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [{ id: 1, name: 'Ada', _url: '/users/1/edit' }]
        }
      }
    });

    await wrapper.find('tbody td[data-column="name"]').trigger('click');

    expect(router.visit).toHaveBeenCalledWith('/users/1/edit', expect.objectContaining({
      preserveScroll: true,
      preserveState: true
    }));
  });

  it('supports custom row-click handling with row and column arguments', async () => {
    const onRowClick = vi.fn();
    const wrapper = mount(Table, {
      props: {
        table: {
          name: 'Users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [{ id: 1, name: 'Ada', _url: '/users/1/edit' }]
        },
        onRowClick
      }
    });

    await wrapper.find('tbody td[data-column="name"]').trigger('click');

    expect(onRowClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, name: 'Ada' }),
      expect.objectContaining({ attribute: 'name' }),
      expect.any(MouseEvent)
    );
    expect(router.visit).not.toHaveBeenCalled();
  });

  it('toggles visible columns immediately', async () => {
    const table = normalizeTable({
      name: 'Users',
      columns: [
        { attribute: 'name', label: 'Name' },
        { attribute: 'email', label: 'Email' }
      ],
      rows: [{ id: 1, name: 'Ada', email: 'ada@example.com' }]
    });

    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        table
      }
    });

    await wrapper.find('button[aria-haspopup="menu"]').trigger('click');
    await nextTick();

    const toggleItems = document.body.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]');

    await new DOMWrapper(toggleItems[1]).trigger('click');
    await nextTick();

    expect(wrapper.findAll('th[data-column]').map((header) => header.text())).toEqual(['Name']);
    expect(wrapper.findAll('tbody td[data-column]').map((cell) => cell.text())).toEqual(['Ada']);
  });

  it('visits pagination links by default', async () => {
    const wrapper = mount(Table, {
      props: {
        table: {
          name: 'Users',
          columns: [{ attribute: 'name', label: 'Name' }],
          results: {
            data: [{ id: 1, name: 'Ada' }],
            current_page: 1,
            last_page: 2,
            next_page_url: '/users?page=2',
            links: [
              { label: '1', url: '/users?page=1', active: true, page: 1 },
              { label: '2', url: '/users?page=2', active: false, page: 2 }
            ]
          }
        }
      }
    });

    expect(wrapper.findAll('[data-test="pagination-button"]')).toHaveLength(4);

    await wrapper.findAll('[data-test="pagination-button"]')[2].trigger('click');

    expect(router.visit).toHaveBeenCalledWith('/users?page=2', expect.objectContaining({
      preserveScroll: true,
      preserveState: true
    }));
  });

  it('visits namespaced search and per page query keys by default', async () => {
    vi.useFakeTimers();

    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        table: {
          name: 'employees',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [{ id: 1, name: 'Ada' }],
          pagination: true,
          perPageOptions: [10, 15, 25, 50],
          state: {
            perPage: 15
          }
        }
      }
    });

    await wrapper.find('input[type="search"]').setValue('ada');
    vi.runAllTimers();

    expect(router.visit).toHaveBeenCalledWith(
      '/?employees%5Bsearch%5D=ada',
      expect.objectContaining({
        preserveScroll: true,
        preserveState: true
      })
    );

    await wrapper.find('[data-test="rows-per-page-trigger"]').setValue('25');
    await nextTick();

    expect(router.visit).toHaveBeenLastCalledWith(
      '/?employees%5BperPage%5D=25',
      expect.objectContaining({
        preserveScroll: true,
        preserveState: true
      })
    );
  });

  it('uses the header column menu for sorting hiding and sticking columns', async () => {
    window.history.pushState({}, '', '/providers');

    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        table: {
          name: 'providers',
          meta: {
            queryString: { columns: 'columns', direction: 'direction', page: 'page', perPage: 'perPage', cursor: 'cursor', search: 'search', sort: 'sort' }
          },
          columns: [
            { attribute: 'provider', label: 'Provider', sortable: true, stickable: true },
            { attribute: 'abn', label: 'ABN' },
            { attribute: 'email', label: 'Email' }
          ],
          rows: [{ id: 1, provider: 'Emerson Goldner', abn: '123', email: 'a@example.com' }],
          pagination: true
        }
      }
    });

    await wrapper.find('th[data-column="provider"] [role="button"][aria-haspopup="menu"]').trigger('click');
    await nextTick();
    await new DOMWrapper(document.body.querySelectorAll<HTMLElement>('[role="menuitem"]')[1]).trigger('click');

    expect(router.visit).toHaveBeenLastCalledWith(
      '/providers?sort=provider&direction=desc',
      expect.objectContaining({
        preserveScroll: true,
        preserveState: true
      })
    );

    window.history.pushState({}, '', '/providers');
    await wrapper.find('th[data-column="abn"] [role="button"][aria-haspopup="menu"]').trigger('click');
    await nextTick();
    const abnMenuItems = document.body.querySelectorAll<HTMLElement>('[role="menuitem"]');
    await new DOMWrapper(abnMenuItems[abnMenuItems.length - 1]).trigger('click');
    await nextTick();

    expect(router.visit).toHaveBeenLastCalledWith(
      '/providers?columns%5B0%5D=abn',
      expect.objectContaining({
        preserveScroll: true,
        preserveState: true
      })
    );

    await wrapper.find('th[data-column="provider"] [role="button"][aria-haspopup="menu"]').trigger('click');
    await nextTick();
    await new DOMWrapper(document.body.querySelectorAll<HTMLElement>('[role="menuitem"]')[2]).trigger('click');
    await nextTick();

    expect(wrapper.find('th[data-column="provider"]').classes()).toContain('sticky');
  });

  it('writes hidden columns to flat indexed query parameters when toggled', async () => {
    window.history.pushState({}, '', '/providers');

    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        table: {
          name: 'providers',
          meta: {
            queryString: { columns: 'columns', page: 'page', perPage: 'perPage', cursor: 'cursor', search: 'search' }
          },
          columns: [
            { attribute: '_actions', label: 'Actions' },
            { attribute: 'company_name', label: 'Company' },
            { attribute: 'abn', label: 'ABN' },
            { attribute: 'email', label: 'Email' },
            { attribute: 'phone', label: 'Phone' },
            { attribute: 'stage.stage', label: 'Stage' }
          ],
          rows: [{ id: 1, _actions: '', company_name: 'Acme', abn: '123', email: 'a@example.com', phone: '555', 'stage.stage': 'Lead' }],
          pagination: true
        }
      }
    });

    await wrapper.find('button[aria-haspopup="menu"]').trigger('click');
    await nextTick();

    const toggleItems = document.body.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]');
    await new DOMWrapper(toggleItems[2]).find('button').trigger('click');
    await nextTick();

    expect(router.visit).toHaveBeenLastCalledWith(
      '/providers?columns%5B0%5D=abn',
      expect.objectContaining({
        preserveScroll: true,
        preserveState: true
      })
    );
  });

  it('uses flat backend query keys and removes stale aliases when changing per page', async () => {
    window.history.pushState({}, '', '/employees?page=2&perPage=15&employees%5BperPage%5D=15');

    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        table: {
          name: 'employees',
          meta: {
            queryString: { page: 'page', perPage: 'perPage', cursor: 'cursor', search: 'search' }
          },
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [{ id: 1, name: 'Ada' }],
          pagination: true,
          perPageOptions: [15, 30, 50],
          defaultPerPage: 15,
          state: {
            perPage: 15
          }
        }
      }
    });

    await wrapper.find('[data-test="rows-per-page-trigger"]').setValue('50');
    await nextTick();

    expect(router.visit).toHaveBeenLastCalledWith(
      '/employees?perPage=50',
      expect.objectContaining({
        preserveScroll: true,
        preserveState: true
      })
    );
  });

  it('normalizes paginated results without mutating the original resource', () => {
    const resource = {
      name: 'Users',
      columns: [{ key: 'name', header: 'Name' }],
      results: {
        data: [{ id: 1, name: 'Ada' }],
        per_page: 25,
        current_page: 2,
        total: 30
      },
      state: {
        search: 'ada',
        sort: 'name',
        direction: 'asc' as const
      }
    };

    const table = normalizeTable(resource);

    expect(table.columns[0]).toMatchObject({
      attribute: 'name',
      label: 'Name',
      sortable: false,
      toggleable: true
    });
    expect(table.rows).toEqual([{ id: 1, name: 'Ada' }]);
    expect(table.pagination).toMatchObject({
      enabled: true,
      perPage: 25,
      currentPage: 2,
      total: 30
    });
    expect(table.sorting).toEqual({ column: 'name', direction: 'asc' });
    expect(table.search).toBe('ada');
    expect(resource.columns[0]).toEqual({ key: 'name', header: 'Name' });
  });
  it('debounces searches and removes nested query aliases', async () => {
    vi.useFakeTimers();
    window.history.pushState({}, '', '/employees?employees%5Bsearch%5D%5B0%5D=old&search=old');
    const wrapper = mount(Table, { props: { table: { name: 'employees', columns: [{ attribute: 'name', label: 'Name' }], rows: [{ id: 1, name: 'Ada' }] } } });

    await wrapper.find('input[type="search"]').setValue('a');
    await wrapper.find('input[type="search"]').setValue('ada');
    vi.runAllTimers();

    expect(router.visit).toHaveBeenLastCalledWith('/employees?employees%5Bsearch%5D=ada', expect.anything());
  });
});
