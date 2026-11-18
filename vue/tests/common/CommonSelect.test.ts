import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import CommonSelect from '../../src/components/Common/CommonSelect.vue';

describe('CommonSelect.vue', () => {
  const options = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
  ];

  it('renders correctly with initial selected label', () => {
    const wrapper = mount(CommonSelect, {
      props: {
        modelValue: 'equals',
        options,
      },
    });

    expect(wrapper.text()).toContain('Equals');
    expect(wrapper.find('[role="combobox"]').attributes('aria-expanded')).toBe('false');
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);

    const nativeSelect = wrapper.find('select');
    expect(nativeSelect.exists()).toBe(true);
    expect((nativeSelect.element as HTMLSelectElement).value).toBe('equals');
  });

  it('opens and closes dropdown on trigger click', async () => {
    const wrapper = mount(CommonSelect, {
      props: {
        modelValue: 'equals',
        options,
      },
    });

    const trigger = wrapper.find('[role="combobox"]');
    await trigger.trigger('click');

    expect(wrapper.find('[role="combobox"]').attributes('aria-expanded')).toBe('true');
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);

    const optionItems = wrapper.findAll('[role="option"]');
    expect(optionItems).toHaveLength(3);
    expect(optionItems[0].text()).toContain('Equals');
    expect(optionItems[1].text()).toContain('Not Equals');
    expect(optionItems[2].text()).toContain('Contains');

    // Click trigger again to close
    await trigger.trigger('click');
    expect(wrapper.find('[role="combobox"]').attributes('aria-expanded')).toBe('false');
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it('emits update:modelValue and change when an option is selected', async () => {
    const wrapper = mount(CommonSelect, {
      props: {
        modelValue: 'equals',
        options,
      },
    });

    await wrapper.find('[role="combobox"]').trigger('click');
    const optionItems = wrapper.findAll('[role="option"]');
    await optionItems[1].trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['not_equals']);
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual(['not_equals']);
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it('navigates with keyboard and selects with Enter', async () => {
    const wrapper = mount(CommonSelect, {
      props: {
        modelValue: 'equals',
        options,
      },
    });

    const trigger = wrapper.find('[role="combobox"]');
    await trigger.trigger('keydown', { key: 'ArrowDown' });
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);

    await trigger.trigger('keydown', { key: 'ArrowDown' });
    await trigger.trigger('keydown', { key: 'Enter' });

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['not_equals']);
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it('closes on Escape or Tab', async () => {
    const wrapper = mount(CommonSelect, {
      props: {
        modelValue: 'equals',
        options,
      },
    });

    const trigger = wrapper.find('[role="combobox"]');
    await trigger.trigger('click');
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);

    await trigger.trigger('keydown', { key: 'Escape' });
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);

    await trigger.trigger('click');
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);

    await trigger.trigger('keydown', { key: 'Tab' });
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it('automatically sets overflow: visible on parent .zt-dropdown when opened', async () => {
    const parent = document.createElement('div');
    parent.className = 'zt-dropdown overflow-hidden';
    parent.style.overflow = 'hidden';
    document.body.appendChild(parent);

    const wrapper = mount(CommonSelect, {
      props: {
        modelValue: 'equals',
        options,
      },
      attachTo: parent,
    });

    expect(parent.style.overflow).toBe('hidden');

    const trigger = wrapper.find('[role="combobox"]');
    await trigger.trigger('click');

    expect(parent.style.overflow).toBe('visible');

    wrapper.unmount();
    document.body.removeChild(parent);
  });

  it('automatically flips placement to top when space below is insufficient', async () => {
    const wrapper = mount(CommonSelect, {
      props: {
        modelValue: 'equals',
        options,
      },
    });

    const triggerEl = wrapper.find('[role="combobox"]').element as HTMLElement;
    vi.spyOn(triggerEl, 'getBoundingClientRect').mockReturnValue({
      top: 500,
      bottom: 532,
      left: 100,
      right: 250,
      width: 150,
      height: 32,
      x: 100,
      y: 500,
      toJSON: () => {},
    });

    // Window height with small space below (550 - 532 = 18px below, but 500px above)
    Object.defineProperty(window, 'innerHeight', { value: 550, writable: true });

    await wrapper.find('[role="combobox"]').trigger('click');
    await nextTick();

    const listbox = wrapper.find('[role="listbox"]');
    expect(listbox.exists()).toBe(true);
    expect(listbox.element.parentElement?.classList.contains('bottom-full')).toBe(true);
  });

  it('does not open when disabled', async () => {
    const wrapper = mount(CommonSelect, {
      props: {
        modelValue: 'equals',
        options,
        disabled: true,
      },
    });

    await wrapper.find('[role="combobox"]').trigger('click');
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it('supports multiple mode with toggling options and summary display label', async () => {
    const wrapper = mount(CommonSelect, {
      props: {
        multiple: true,
        modelValue: ['equals'],
        options,
        placeholder: 'Select options...',
      },
    });

    expect(wrapper.text()).toContain('Equals');

    await wrapper.find('[role="combobox"]').trigger('click');
    await nextTick();

    const optionItems = wrapper.findAll('[role="option"]');
    expect(optionItems).toHaveLength(3);

    // Click 'contains' option to toggle it on
    await optionItems[2].trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['equals', 'contains']]);

    // Update prop to reflect multiple selected
    await wrapper.setProps({ modelValue: ['equals', 'not_equals', 'contains'] });
    expect(wrapper.text()).toContain('3 selected');
  });

  it('supports useIndexValue mode on native select', async () => {
    const wrapper = mount(CommonSelect, {
      props: {
        modelValue: 'not_equals',
        options,
        useIndexValue: true,
      },
    });

    const nativeSelect = wrapper.find('select');
    expect((nativeSelect.element as HTMLSelectElement).value).toBe('1');

    await nativeSelect.setValue('2');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['contains']);
  });

  it('filters searchable options and selects the filtered result', async () => {
    const wrapper = mount(CommonSelect, {
      props: {
        modelValue: '',
        options,
        searchable: true,
      },
    });

    await wrapper.find('[role="combobox"]').trigger('click');
    const search = wrapper.find('input[type="search"]');
    expect(search.exists()).toBe(true);

    await search.setValue('not');
    const optionItems = wrapper.findAll('[role="option"]');
    expect(optionItems).toHaveLength(1);
    expect(optionItems[0].text()).toContain('Not Equals');

    await search.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['not_equals']);
  });

  it('shows an empty state when a search has no matches', async () => {
    const wrapper = mount(CommonSelect, {
      props: {
        options,
        searchable: true,
      },
    });

    await wrapper.find('[role="combobox"]').trigger('click');
    await wrapper.find('input[type="search"]').setValue('missing');

    expect(wrapper.findAll('[role="option"]')).toHaveLength(0);
    expect(wrapper.find('[role="status"]').text()).toBe('No options found');
  });
});
