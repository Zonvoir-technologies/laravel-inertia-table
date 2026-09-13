import { DOMWrapper, flushPromises, mount } from '@vue/test-utils';
import { router } from '@inertiajs/vue3';
import { nextTick } from 'vue';
import { vi } from 'vitest';
import { Table } from '../src';
import TableExports from '../src/components/TableExports.vue';
import { formDataEntries, installTableTestHooks } from './tableTestUtils';

installTableTestHooks();

describe('Table Exports', () => {
  it('posts export actions with hidden table state selected keys csrf headers and custom data', async () => {
    document.cookie = 'XSRF-TOKEN=csrf-token-value';
    window.history.pushState({}, '', '/users');

    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        table: {
          name: 'users',
          columns: [
            { attribute: 'name', label: 'Name' },
            { attribute: 'email', label: 'Email', visible: false }
          ],
          rows: [{ id: 1, name: 'Ada', email: 'ada@example.com' }],
          pagination: true,
          state: { search: 'ada', sort: 'name', direction: 'asc', page: 2, perPage: 25 },
          meta: { table: 'UsersTable', exportEndpoint: '/table/export' },
          exports: [{ key: 'xlsx', label: 'Excel', data: { includeHidden: false } }]
        }
      }
    });

    await wrapper.find('tbody input[aria-label="Select row"]').setValue(true);
    await wrapper.findAll('button').find((button) => button.text() === 'Export')!.trigger('click');
    await nextTick();
    await new DOMWrapper(document.body.querySelector<HTMLElement>('[role="menuitem"]')!).trigger('click');

    expect(router.visit).toHaveBeenCalledWith('/table/export', expect.objectContaining({
      method: 'post',
      preserveScroll: true,
      preserveState: false,
      data: {
        table: 'UsersTable',
        export: 'xlsx',
        keys: [1],
        state: {
          page: 2,
          perPage: 25,
          cursor: null,
          search: 'ada',
          sort: 'name',
          direction: 'asc',
          columns: ['email'],
          sticky: []
        },
        data: { includeHidden: false }
      }
    }));
  });

  it('shows the queued export processing alert from the Inertia response', async () => {
    type ExportVisitOptions = {
      onSuccess?: (page: never) => void;
      onFinish?: () => void;
    };

    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        table: {
          name: 'users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [{ id: 1, name: 'Ada' }],
          meta: { table: 'UsersTable', exportEndpoint: '/table/export' },
          exports: [{ key: 'xlsx', label: 'Excel', queued: true }]
        }
      }
    });

    await wrapper.findAll('button').find((button) => button.text() === 'Export')!.trigger('click');
    await nextTick();
    await new DOMWrapper(document.body.querySelector<HTMLElement>('[role="menuitem"]')!).trigger('click');

    const visitOptions = (vi.mocked(router.visit).mock.calls[0] as unknown as [string, ExportVisitOptions])[1];

    visitOptions.onSuccess?.({
      props: {
        flash: {
          table_export_dialog: {
            title: 'Queued',
            message: 'We will email you shortly.'
          }
        }
      }
    } as never);
    visitOptions.onFinish?.();
    await nextTick();

    expect(document.body.querySelector('[role="alertdialog"]')?.textContent).toContain('Queued');
    expect(document.body.querySelector('[role="alertdialog"]')?.textContent).toContain('We will email you shortly.');
  });

  it('disables exports that require selected rows until a row is selected', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        table: {
          name: 'users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [{ id: 1, name: 'Ada' }],
          meta: { table: 'UsersTable', exportEndpoint: '/table/export' },
          exports: [{ key: 'selected', label: 'Selected rows', limitToSelectedRows: true }]
        }
      }
    });

    await wrapper.findAll('button').find((button) => button.text() === 'Export')!.trigger('click');
    await nextTick();

    const disabledExport = document.body.querySelector<HTMLButtonElement>('[role="menuitem"]')!;

    expect(disabledExport.disabled).toBe(true);

    await wrapper.find('tbody input[aria-label="Select row"]').setValue(true);
    await wrapper.findAll('button').find((button) => button.text() === 'Export')!.trigger('click');
    await nextTick();
    await wrapper.findAll('button').find((button) => button.text() === 'Export')!.trigger('click');
    await nextTick();

    const enabledExport = document.body.querySelector<HTMLButtonElement>('[role="menuitem"]')!;

    expect(enabledExport.disabled).toBe(false);
  });

  it('downloads export responses with FormData payloads and disables the export while loading', async () => {
    document.cookie = 'XSRF-TOKEN=csrf-token-value';

    let resolveFetch: (response: Response) => void = () => {};
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    const fetchMock = vi.fn((url: string, options: RequestInit) => {
      void url;
      void options;

      return fetchPromise;
    });
    const objectUrlMock = vi.fn(() => 'blob:export-url');
    const revokeObjectUrlMock = vi.fn();
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    vi.stubGlobal('fetch', fetchMock);
    const NativeUrl = URL;
    vi.stubGlobal('URL', class extends NativeUrl {
      static createObjectURL = objectUrlMock;
      static revokeObjectURL = revokeObjectUrlMock;
    });

    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        table: {
          name: 'users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [{ id: 1, name: 'Ada' }],
          pagination: true,
          state: { search: 'ada', sort: 'name', direction: 'desc', perPage: 15 },
          meta: { table: 'UsersTable' },
          exports: [{
            key: 'download',
            label: 'Download Excel',
            endpoint: '/table/export/download',
            asDownload: true,
            data: { format: 'xlsx' }
          }]
        }
      }
    });

    await wrapper.find('tbody input[aria-label="Select row"]').setValue(true);
    await wrapper.findAll('button').find((button) => button.text() === 'Export')!.trigger('click');
    await nextTick();
    await new DOMWrapper(document.body.querySelector<HTMLButtonElement>('[role="menuitem"]')!).trigger('click');
    await nextTick();

    await wrapper.findAll('button').find((button) => button.text() === 'Export')!.trigger('click');
    await nextTick();

    expect(document.body.querySelector<HTMLButtonElement>('[role="menuitem"]')?.disabled).toBe(true);

    const request = (fetchMock.mock.calls[0] as [string, RequestInit])[1];
    const body = request.body as FormData;

    expect(fetchMock).toHaveBeenCalledWith('/table/export/download', expect.objectContaining({
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'X-XSRF-TOKEN': 'csrf-token-value' }
    }));
    expect(formDataEntries(body)).toMatchObject({
      table: 'UsersTable',
      export: 'download',
      'keys[0]': '1',
      'state[page]': '1',
      'state[perPage]': '15',
      'state[search]': 'ada',
      'state[sort]': 'name',
      'state[direction]': 'desc',
      'data[format]': 'xlsx'
    });

    resolveFetch(new Response(new Blob(['excel']), {
      status: 200,
      headers: { 'content-disposition': 'attachment; filename="users.xlsx"' }
    }));
    await flushPromises();

    await nextTick();

    expect(document.body.querySelector<HTMLButtonElement>('[role="menuitem"]')?.disabled).toBe(false);
    expect(anchorClick).toHaveBeenCalled();
    expect(objectUrlMock).toHaveBeenCalledOnce();
    expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:export-url');
  });
});

describe('TableExports remaining paths', () => {
  it('omits hidden exports and emits an export that has no endpoint', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: { table: { name: 'Users', columns: [{ attribute: 'name', label: 'Name' }], rows: [], meta: { table: 'UsersTable' }, exports: [
        { key: 'hidden', label: 'Hidden', hidden: true }, { key: 'local', label: 'Local export' },
      ] } },
    });
    await wrapper.findAll('button').find((button) => button.text() === 'Export')!.trigger('click');
    await nextTick();
    const menuItem = document.body.querySelector<HTMLElement>('[role="menuitem"]')!;
    expect(menuItem.textContent).toContain('Local export');
    expect(document.body.textContent).not.toContain('Hidden');
    await new DOMWrapper(menuItem).trigger('click');
    expect(router.visit).not.toHaveBeenCalled();
  });

  it('shows default processing feedback for asynchronous exports', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: { table: { name: 'Users', columns: [{ attribute: 'name', label: 'Name' }], rows: [], meta: { table: 'UsersTable', exportEndpoint: '/exports' }, exports: [
        { key: 'async', label: 'Async', asDownload: false },
      ] } },
    });
    await wrapper.findAll('button').find((button) => button.text() === 'Export')!.trigger('click');
    await nextTick();
    await new DOMWrapper(document.body.querySelector<HTMLElement>('[role="menuitem"]')!).trigger('click');
    const options = vi.mocked(router.visit).mock.calls[0][1] as { onSuccess: (page: never) => void; onFinish: () => void };
    options.onSuccess({ props: {} } as never);
    options.onFinish();

    await nextTick();
    expect(document.body.querySelector('[role="alertdialog"]')?.textContent).toContain('Export started');
  });
});

describe('TableExports remaining flows', () => {
  it('emits exports that have no endpoint without visiting Inertia', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: { table: {
        name: 'Users', columns: [{ attribute: 'name', label: 'Name' }], rows: [{ id: 1, name: 'Ada' }],
        meta: { table: 'UsersTable' }, exports: [{ key: 'client', label: 'Client export' }],
      } },
    });
    await wrapper.findAll('button').find((button) => button.text() === 'Export')!.trigger('click');
    await nextTick();
    await new DOMWrapper(document.body.querySelector<HTMLElement>('[role="menuitem"]')!).trigger('click');

    expect(router.visit).not.toHaveBeenCalled();
    expect(wrapper.findComponent(TableExports).emitted('executed')?.[0]?.[0]).toMatchObject({ export: { key: 'client' } });
  });

  it('shows fallback processing copy for non-download exports', async () => {
    type VisitOptions = { onSuccess: (page: never) => void; onFinish: () => void; preserveState: boolean };
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: { table: {
        name: 'Users', columns: [{ attribute: 'name', label: 'Name' }], rows: [{ id: 1, name: 'Ada' }],
        meta: { table: 'UsersTable', exportEndpoint: '/exports' }, exports: [{ key: 'async', label: 'Async export', asDownload: false }],
      } },
    });
    await wrapper.findAll('button').find((button) => button.text() === 'Export')!.trigger('click');
    await nextTick();
    await new DOMWrapper(document.body.querySelector<HTMLElement>('[role="menuitem"]')!).trigger('click');
    const options = vi.mocked(router.visit).mock.calls[0][1] as VisitOptions;
    expect(options.preserveState).toBe(true);
    options.onSuccess({ props: { flash: { table_export: { title: '', message: '' } } } } as never);
    options.onFinish();
    await nextTick();
    expect(document.body.querySelector('[role="alertdialog"]')?.textContent).toContain('Export started');
  });
});
