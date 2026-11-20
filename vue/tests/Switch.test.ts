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

  it('uses --zt-primary CSS variable for checked state background in light and dark mode', () => {
    const wrapper = mount(Switch, { props: { checked: true } });
    expect(wrapper.classes()).toContain('bg-[var(--zt-primary,#0f172a)]');
    expect(wrapper.classes()).toContain('dark:bg-[var(--zt-primary,#0f172a)]');
  });

  it('renders unchecked state with slate-300 and dark:bg-slate-700', () => {
    const wrapper = mount(Switch, { props: { checked: false } });
    expect(wrapper.classes()).toContain('bg-slate-300');
    expect(wrapper.classes()).toContain('dark:bg-slate-700');
    expect(wrapper.classes()).not.toContain('dark:bg-green-900');
  });

  it('supports custom color and color aliases', () => {
    const custom = mount(Switch, { props: { checked: true, color: 'blue' } });
    expect(custom.classes()).toContain('bg-blue-500');
    expect(custom.classes()).toContain('dark:bg-blue-500');

    const alias = mount(Switch, { props: { checked: true, color: 'danger' } });
    expect(alias.classes()).toContain('bg-red-500');
    expect(alias.classes()).toContain('dark:bg-red-500');
  });
});
