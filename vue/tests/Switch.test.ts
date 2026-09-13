import { mount } from '@vue/test-utils';
import Switch from '../src/components/Switch.vue';

describe('Switch', () => {
  it.each([
    ['sm', 'h-4', 'translate-x-3.5'],
    ['md', 'h-6', 'translate-x-5'],
    ['lg', 'h-8', 'translate-x-7'],
  ] as const)('renders the %s size and toggles state', async (size, sizeClass, checkedClass) => {
    const wrapper = mount(Switch, { props: { checked: true, size } });

    expect(wrapper.classes()).toContain(sizeClass);
    expect(wrapper.find('span').classes()).toContain(checkedClass);
    await wrapper.trigger('click');
    expect(wrapper.emitted('update:checked')).toEqual([[false]]);
  });

  it('renders unchecked disabled switches', () => {
    const wrapper = mount(Switch, { props: { checked: false, disabled: true } });

    expect(wrapper.attributes('data-state')).toBe('unchecked');
    expect(wrapper.attributes('disabled')).toBeDefined();
    expect(wrapper.find('span').classes()).toContain('translate-x-0.5');
  });
});
