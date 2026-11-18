import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TextFilter from '../src/components/filters/TextFilter.vue';

describe('TextFilter.vue', () => {
  const definition = {
    key: 'name',
    label: 'User Name',
    type: 'text',
    comparators: [
      { key: 'equals', label: 'Equals' },
      { key: 'contains', label: 'Contains' },
      { key: 'starts_with', label: 'Starts With' },
    ],
  };

  it('renders label and comparator options', () => {
    const wrapper = mount(TextFilter, {
      props: {
        definition,
        modelValue: { comparator: 'contains', value: 'Alice' },
      },
    });

    expect(wrapper.text()).toContain('User Name');
    const select = wrapper.find('select');
    expect(select.exists()).toBe(true);
    const options = select.findAll('option');
    expect(options).toHaveLength(3);
    expect(options[1].text()).toBe('Contains');

    const input = wrapper.find('input');
    expect((input.element as HTMLInputElement).value).toBe('Alice');
  });

  it('emits update:modelValue when value changes', async () => {
    const wrapper = mount(TextFilter, {
      props: {
        definition,
        modelValue: { comparator: 'equals', value: '' },
      },
    });

    const input = wrapper.find('input');
    await input.setValue('Bob');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([
      { comparator: 'equals', value: 'Bob' },
    ]);
  });

  it('emits null on clear button click', async () => {
    const wrapper = mount(TextFilter, {
      props: {
        definition,
        modelValue: { comparator: 'equals', value: 'Existing' },
      },
    });

    const clearButton = wrapper.find('button');
    expect(clearButton.exists()).toBe(true);
    expect(clearButton.text()).toBe('Clear');
    await clearButton.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([null]);
  });

  it('renders in compact mode without header label and clear button', () => {
    const wrapper = mount(TextFilter, {
      props: {
        definition,
        compact: true,
        modelValue: { comparator: 'equals', value: 'Alice' },
      },
    });

    expect(wrapper.find('label').exists()).toBe(false);
    expect(wrapper.find('button').exists()).toBe(false);
    expect(wrapper.find('select').exists()).toBe(true);
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('emits enter when pressing Enter in input', async () => {
    const wrapper = mount(TextFilter, {
      props: {
        definition,
        modelValue: { comparator: 'equals', value: 'John' },
      },
    });

    const input = wrapper.find('input');
    await input.trigger('keydown.enter');

    expect(wrapper.emitted('enter')).toBeTruthy();
  });
});
