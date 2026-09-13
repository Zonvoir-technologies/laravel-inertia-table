import { computed, defineComponent, h, type Component } from 'vue';
import { mount } from '@vue/test-utils';
import {
  configureTable,
  iconFor,
  provideTableConfiguration,
  resetTableConfiguration,
  resolveTableConfiguration,
  tableClass,
  useTableConfiguration,
} from '../src/config/tableConfig';

afterEach(() => resetTableConfiguration());

describe('table configuration', () => {
  it('merges overrides, deduplicates classes, and enables the dark theme', () => {
    const configuration = configureTable({
      icons: { search: 'custom-search' },
      classes: { root: 'zt-table custom custom', toolbar: '' },
      labels: { search: 'Find rows' },
      darkMode: true,
    });

    expect(configuration.icons.search).toBe('custom-search');
    expect(configuration.labels.search).toBe('Find rows');
    expect(configuration.classes.root.split(' ').filter((token) => token === 'custom')).toHaveLength(1);
    expect(configuration.classes.rootDark).toContain('dark');
    expect(configuration.classes.toolbar).toContain('dark:bg-slate-900');
  });

  it('accepts object dark-mode settings and raw Vue icon components', () => {
    const Icon = defineComponent({ render: () => h('svg') });
    const configuration = resolveTableConfiguration({
      icons: { retry: Icon as Component },
      darkMode: { enabled: true, class: 'theme-dark', attribute: 'data-theme' },
    });

    expect(configuration.darkMode).toMatchObject({ enabled: true, class: 'theme-dark', attribute: 'data-theme' });
    expect(configuration.icons.retry).toBe(Icon);
  });

  it('provides configuration to descendants and resolves classes and icons', () => {
    const Child = defineComponent({
      setup() {
        const configuration = useTableConfiguration();
        return () => h('output', {
          'data-class': tableClass('root', ['extra', false, 'extra']),
          'data-search-icon': String(iconFor('search')),
          'data-fallback-icon': String(iconFor('unconfigured-icon')),
          'data-label': configuration.value.labels.search,
        });
      },
    });
    const Parent = defineComponent({
      setup() {
        provideTableConfiguration(computed(() => ({
          icons: { search: 'provided-search' },
          labels: { search: 'Provided search' },
        })));
        return () => h(Child);
      },
    });

    const output = mount(Parent).find('output');

    expect(output.attributes('data-class')).toContain('extra');
    expect(output.attributes('data-search-icon')).toBe('provided-search');
    expect(output.attributes('data-fallback-icon')).toBe('unconfigured-icon');
    expect(output.attributes('data-label')).toBe('Provided search');
  });

  it('uses the global configuration when no provider is present', () => {
    configureTable({ labels: { search: 'Global search' }, darkMode: false });
    expect(resolveTableConfiguration().labels.search).toBe('Global search');
    expect(resolveTableConfiguration().darkMode.enabled).toBe(false);
  });
});
