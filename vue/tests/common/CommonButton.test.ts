import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import CommonButton from '../../src/components/Common/CommonButton.vue';
import { configureTable, resetTableConfiguration } from '../../src/config/tableConfig';

const componentStubs = {
  CommonIcon: { props: ['icon'], template: '<i :data-icon="icon" />' },
  Spinner: { template: '<span data-spinner />' },
};

afterEach(() => resetTableConfiguration());

describe('CommonButton', () => {
  it.each([
    ['slate', 'solid', 'default'], ['gray', 'outline', 'sm'], ['zinc', 'ghost', 'lg'],
    ['red', 'link', 'icon'], ['orange', 'solid', 'icon-sm'], ['blue', 'outline', 'icon-lg'], ['brand', 'ghost', 'default'],
  ])('renders color %s, variant %s, and size %s', (color, variant, size) => {
    const wrapper = mount(CommonButton, {
      props: { color, variant: variant as never, size: size as never, leadingIcon: 'before', trailingIcon: 'after' }, attrs: { class: 'consumer-class', 'aria-label': 'Action' },
      slots: { default: 'Action' }, global: { stubs: componentStubs },
    });
    expect(wrapper.classes()).toContain('consumer-class');
    expect(wrapper.attributes('aria-label')).toBe('Action');
    expect(wrapper.findAll('i')).toHaveLength(2);
  });

  it('renders loading and disabled buttons and normalizes invalid variants', () => {
    const loading = mount(CommonButton, { props: { loading: true, disabled: true }, global: { stubs: componentStubs } });
    const invalid = mount(CommonButton, { props: { variant: 'invalid' as never } });
    expect(loading.attributes('disabled')).toBeDefined();
    expect(loading.find('[data-spinner]').exists()).toBe(true);
    expect(invalid.classes()).toContain('bg-neutral-500');
  });

  it('applies dark styles for neutral, semantic, and dynamic colors', () => {
    configureTable({ darkMode: true });
    for (const [color, variant, expected] of [
      ['neutral', 'solid', 'dark:bg-slate-950'], ['neutral', 'link', 'dark:text-slate-100'],
      ['danger', 'outline', 'dark:bg-red-950/40'], ['brand', 'outline', 'dark:bg-brand-950/40'],
      ['brand', 'solid', 'bg-brand-500'],
    ]) expect(mount(CommonButton, { props: { color, variant: variant as never } }).classes()).toContain(expected);
  });
});
