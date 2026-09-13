import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import CommonBadge from '../../src/components/Common/CommonBadge.vue';
import { configureTable, resetTableConfiguration } from '../../src/config/tableConfig';

const componentStubs = {
  CommonIcon: { props: ['icon'], template: '<i :data-icon="icon" />' },
};

afterEach(() => resetTableConfiguration());

describe('CommonBadge', () => {
  it.each([
    ['slate', 'solid'], ['gray', 'outline'], ['zinc', 'ghost'], ['red', 'solid'],
    ['orange', 'outline'], ['amber', 'ghost'], ['blue', 'solid'], ['violet', 'outline'],
    ['rose', 'ghost'], ['brand', 'solid'],
  ])('renders color %s and variant %s', (color, variant) => {
    const wrapper = mount(CommonBadge, {
      props: { color, variant, icon: 'check' }, slots: { default: 'Status' }, global: { stubs: componentStubs },
    });
    expect(wrapper.attributes('data-color')).toBe(color);
    expect(wrapper.attributes('data-variant')).toBe(variant);
    expect(wrapper.find('[data-icon="check"]').exists()).toBe(true);
  });

  it('normalizes aliases and invalid variants', () => {
    const wrapper = mount(CommonBadge, { props: { color: 'danger', variant: 'invalid' } });
    expect(wrapper.attributes('data-color')).toBe('red');
    expect(wrapper.attributes('data-variant')).toBe('outline');
  });

  it('applies dark styles for neutral, semantic, and dynamic colors', () => {
    configureTable({ darkMode: true });
    for (const [color, variant, expected] of [
      ['neutral', 'solid', 'dark:bg-slate-950'], ['neutral', 'ghost', 'dark:bg-transparent'],
      ['success', 'outline', 'dark:bg-green-950/40'], ['brand', 'outline', 'dark:bg-brand-950/40'],
      ['brand', 'solid', 'bg-brand-500'],
    ]) expect(mount(CommonBadge, { props: { color, variant: variant as never } }).classes()).toContain(expected);
  });
});
