import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { vi } from 'vitest';
import { useActions } from '../../src/composables/useActions';
import { normalizeTable } from '../../src/helpers/normalizeTable';
import type { TableAction, TableResource } from '../../src/types/table';
import { installTableTestHooks } from '../tableTestUtils';

installTableTestHooks();

const table: TableResource = {
  name: 'Users',
  rowSelectionKey: 'uuid',
  columns: [{ attribute: 'name', label: 'Name' }],
  rows: [{ uuid: 'a', name: 'Ada' }, { uuid: 'b', name: 'Grace', _selectable: false }],
  meta: { table: 'UsersTable' }
};

describe('useActions', () => {
  it('selects selectable rows and clears internal selection', () => {
    const actions = useActions(table);
    actions.toggleItem('a');
    expect(actions.selectedItems.value).toEqual(['a']);
    expect(actions.allItemsAreSelected.value).toBe(true);
    actions.toggleItem('*');
    expect(actions.selectedItems.value).toEqual([]);
    actions.toggleItem('*');
    actions.clearSelection();
    expect(actions.selectedItems.value).toEqual([]);
  });

  it('uses supplied selection state without mutating it', () => {
    const selected = ref(['a']);
    const actions = useActions(table, { selectedKeys: selected, selectionMode: ref('all') });
    actions.toggleItem('b');
    actions.clearSelection();
    expect(selected.value).toEqual(['a']);
    actions.performAction({ key: 'archive', label: 'Archive', type: 'action', endpoint: '/archive' });
    expect(router.visit).toHaveBeenCalledWith('/archive', expect.objectContaining({ data: expect.objectContaining({ keys: ['a'], selectionMode: 'all' }) }));
  });

  it('dispatches custom, external-url, and endpoint actions', () => {
    const onExecuted = vi.fn();
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const actions = useActions(table, { onExecuted });
    const custom: TableAction = { key: 'custom', label: 'Custom', type: 'custom' };
    actions.performAction(custom);
    actions.performAction({ key: 'external', label: 'External', type: 'link', url: { url: 'https://example.test', target: '_blank' } });
    actions.performAction({ key: 'post', label: 'Post', type: 'action', endpoint: '/action', data: { source: 'test' } }, ['a']);
    expect(onExecuted).toHaveBeenCalledWith({ action: custom });
    expect(open).toHaveBeenCalledWith('https://example.test', '_blank');
    expect(router.visit).toHaveBeenCalledWith('/action', expect.objectContaining({ method: 'post', data: expect.objectContaining({ table: 'UsersTable', keys: ['a'] }) }));
    const options = vi.mocked(router.visit).mock.calls[0][1] as { onFinish: () => void };
    options.onFinish();
    expect(actions.loadingAction.value).toBeNull();
  });
});
describe('useActions remaining branches', () => {
  it('handles unavailable tables, valid definitions, missing selection keys, and non-selectable row keys', () => {
    const unavailable = useActions(undefined);
    unavailable.toggleItem('*');
    expect(unavailable.selectedItems.value).toEqual([]);
    unavailable.performAction({ key: 'run', label: 'Run', type: 'action', endpoint: '/run' });
    expect(router.visit).not.toHaveBeenCalled();

    const normalized = useActions(normalizeTable(table));
    normalized.toggleItem('*');
    expect(normalized.selectedItems.value).toEqual(['a']);

    const numericKeys = useActions({
      ...table,
      rowSelectionKey: 'id',
      rows: [{ id: 1 }, { id: 'two' }, { id: null }, { id: 4, _selectable: false }],
    });
    numericKeys.toggleItem('*');
    expect(numericKeys.selectedItems.value).toEqual([1, 'two']);

    const noKey = useActions({ ...normalizeTable(table), rowSelectionKey: '' });
    noKey.toggleItem('*');
    expect(noKey.selectedItems.value).toEqual([]);

    const actions = useActions(table);
    actions.toggleItem('a');
    actions.toggleItem('a');
    expect(actions.selectedItems.value).toEqual([]);
  });

  it('uses same-window URLs with default and explicit visit options', () => {
    const actions = useActions(table);
    actions.performAction({ key: 'show', label: 'Show', type: 'link', url: { url: '/users/a' } });
    actions.performAction({ key: 'edit', label: 'Edit', type: 'link', url: { url: '/users/a/edit', method: 'put', preserveScroll: false, preserveState: true } });

    expect(router.visit).toHaveBeenNthCalledWith(1, '/users/a', { method: 'get', preserveScroll: undefined, preserveState: undefined });
    expect(router.visit).toHaveBeenNthCalledWith(2, '/users/a/edit', { method: 'put', preserveScroll: false, preserveState: true });
  });

  it('executes endpoint-less actions and sends default endpoint payloads', () => {
    const onExecuted = vi.fn();
    const actions = useActions(table, { onExecuted });
    const noEndpoint: TableAction = { key: 'local', label: 'Local', type: 'action' };
    const customWithEndpoint: TableAction = { key: 'custom', label: 'Custom', type: 'custom', endpoint: '/ignored' };
    actions.performAction(noEndpoint);
    actions.performAction(customWithEndpoint);
    expect(onExecuted).toHaveBeenCalledWith({ action: noEndpoint });
    expect(onExecuted).toHaveBeenCalledWith({ action: customWithEndpoint });

    actions.performAction({ key: 'archive', label: 'Archive', type: 'action', endpoint: '/archive' });
    expect(actions.isPerformingAction.value).toBe(true);
    expect(router.visit).toHaveBeenCalledWith('/archive', expect.objectContaining({
      data: expect.objectContaining({ keys: [], selectionMode: 'page', data: {} }),
    }));
    const visitOptions = vi.mocked(router.visit).mock.calls.at(-1)?.[1] as { onFinish: () => void };
    visitOptions.onFinish();
    expect(actions.isPerformingAction.value).toBe(false);
    expect(onExecuted).toHaveBeenCalledWith({ action: expect.objectContaining({ key: 'archive' }) });
  });
});
