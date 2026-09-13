import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ToggleColumnsDropdown from '../src/components/ToggleColumnsDropdown.vue';
import type { TableColumn } from '../src/types/table';
import { installTableTestHooks } from './tableTestUtils';

installTableTestHooks();

const columns: TableColumn[] = [
  { attribute: 'name', label: 'Name', sortable: false, toggleable: true, visible: true, alignment: 'left', meta: {} },
  { attribute: 'email', label: 'Email', sortable: false, toggleable: true, visible: true, alignment: 'left', meta: {} },
];

describe('ToggleColumnsDropdown', () => {
  it('filters columns, shows the empty state, and toggles by row and switch', async () => {
    const wrapper = mount(ToggleColumnsDropdown, {
      attachTo: document.body,
      props: { columns, isColumnVisible: (attribute: string) => attribute === 'name' },
    });

    await wrapper.find('button').trigger('click');
    await nextTick();
    expect(document.body.querySelectorAll('[role="menuitemcheckbox"]')).toHaveLength(2);

    const input = document.body.querySelector<HTMLInputElement>('input[type="search"]')!;
    input.value = 'mail';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
    expect(document.body.querySelectorAll('[role="menuitemcheckbox"]')).toHaveLength(1);

    input.value = 'missing';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
    expect(document.body.textContent).toContain('No columns found.');

    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
    const items = document.body.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]');
    items[0].click();
    await nextTick();
    expect(wrapper.emitted('toggle')).toContainEqual(['name']);
    const switchButton = items[1].querySelector<HTMLButtonElement>('[role="switch"]')!;
    switchButton.click();

    await nextTick();
    expect(wrapper.emitted('toggle')).toContainEqual(['email']);
  });
});
