import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, type ComponentMountingOptions } from '@vue/test-utils';
import CommonDateRangePicker from '../../src/components/Common/CommonDateRangePicker.vue';
import { configureTable, resetTableConfiguration } from '../../src/config/tableConfig';

const mountPicker = (options: ComponentMountingOptions<typeof CommonDateRangePicker> = {}) => {
  return mount(CommonDateRangePicker, {
    ...options,
    global: {
      stubs: {
        teleport: true,
      },
      ...options.global,
    },
  });
};

describe('CommonDateRangePicker component', () => {
  afterEach(() => {
    resetTableConfiguration();
  });
  it('renders closed initially and displays placeholder', () => {
    const wrapper = mountPicker({
      props: {
        placeholder: 'Select date range...',
      },
    });

    expect(wrapper.text()).toContain('Select date range...');
    expect(wrapper.find('[role="combobox"]').attributes('aria-expanded')).toBe('false');
    expect(wrapper.find('.zonvoir-common-date-range-picker').exists()).toBe(true);
  });

  it('opens and closes popover on trigger click', async () => {
    const wrapper = mountPicker({
      props: {
        modelValue: ['2026-09-01', '2026-09-10'],
      },
    });

    const trigger = wrapper.find('[role="combobox"]');
    await trigger.trigger('click');

    expect(trigger.attributes('aria-expanded')).toBe('true');
    expect(wrapper.findAll('select').length).toBeGreaterThanOrEqual(2); // 2 months by default

    // Click again to close
    await trigger.trigger('click');
    expect(trigger.attributes('aria-expanded')).toBe('false');
  });

  it('displays formatted date range in the trigger', () => {
    const wrapper = mountPicker({
      props: {
        modelValue: ['2026-09-01', '2026-09-15'],
      },
    });

    expect(wrapper.text()).toContain('Sep 1, 2026 – Sep 15, 2026');
  });

  it('selects start date and then end date over two clicks', async () => {
    const wrapper = mountPicker({
      props: {
        modelValue: ['', ''],
      },
    });

    // Open popover
    await wrapper.find('[role="combobox"]').trigger('click');

    // Find day buttons in the first calendar
    const dayButtons = wrapper.findAll('button').filter((b) => /^\d+$/.test(b.text()));
    const day5 = dayButtons.find((b) => b.text() === '5');
    const day20 = dayButtons.find((b) => b.text() === '20');

    expect(day5).toBeDefined();
    expect(day20).toBeDefined();

    // First click: sets start date
    await day5?.trigger('click');
    expect(wrapper.text()).toContain('Click end date');

    // Second click: sets end date and commits
    await day20?.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    const emitted = wrapper.emitted('update:modelValue')!;
    const lastValue = emitted[emitted.length - 1][0] as [string, string];
    expect(lastValue[0]).toContain('-05');
    expect(lastValue[1]).toContain('-20');
  });

  it('auto-swaps start and end dates if user picks earlier end date', async () => {
    const wrapper = mountPicker({
      props: {
        modelValue: ['', ''],
      },
    });

    await wrapper.find('[role="combobox"]').trigger('click');

    const dayButtons = wrapper.findAll('button').filter((b) => /^\d+$/.test(b.text()));
    const day10 = dayButtons.find((b) => b.text() === '10');
    const day2 = dayButtons.find((b) => b.text() === '2');

    // Click 10 first, then 2
    await day10?.trigger('click');
    await day2?.trigger('click');

    const emitted = wrapper.emitted('update:modelValue')!;
    const lastValue = emitted[emitted.length - 1][0] as [string, string];
    expect(lastValue[0] <= lastValue[1]).toBe(true);
    expect(lastValue[0]).toContain('-02');
    expect(lastValue[1]).toContain('-10');
  });

  it('renders clean calendar popover without presets sidebar', async () => {
    const wrapper = mountPicker();

    await wrapper.find('[role="combobox"]').trigger('click');

    expect(wrapper.text()).not.toContain('Presets');
  });

  it('clears date range with clear button', async () => {
    const wrapper = mountPicker({
      props: {
        modelValue: ['2026-09-01', '2026-09-15'],
        clearable: true,
      },
    });

    const clearBtn = wrapper.find('button[aria-label="Clear date range"]');
    expect(clearBtn.exists()).toBe(true);

    await clearBtn.trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['', '']]);
  });

  it('renders synchronized native inputs with proper aria labels', async () => {
    const wrapper = mountPicker({
      props: {
        modelValue: ['2026-09-01', '2026-09-15'],
        ariaLabelStart: 'Filter value 1',
        ariaLabelEnd: 'Filter value 2',
      },
    });

    const nativeInputs = wrapper.findAll<HTMLInputElement>('input[type="date"]');
    expect(nativeInputs).toHaveLength(2);

    expect(nativeInputs[0].attributes('aria-label')).toBe('Filter value 1');
    expect(nativeInputs[0].element.value).toBe('2026-09-01');

    expect(nativeInputs[1].attributes('aria-label')).toBe('Filter value 2');
    expect(nativeInputs[1].element.value).toBe('2026-09-15');

    // Updating native input updates modelValue
    await nativeInputs[0].setValue('2026-09-05');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['2026-09-05', '2026-09-15']]);
  });

  it('disables dates outside minDate and maxDate', async () => {
    const wrapper = mountPicker({
      props: {
        minDate: '2026-09-10',
        maxDate: '2026-09-20',
        modelValue: ['2026-09-10', '2026-09-20'],
      },
    });

    await wrapper.find('[role="combobox"]').trigger('click');

    const dayButtons = wrapper.findAll('button').filter((b) => /^\d+$/.test(b.text()));
    const day5 = dayButtons.find((b) => b.text() === '5');
    const day15 = dayButtons.find((b) => b.text() === '15');
    const day25 = dayButtons.find((b) => b.text() === '25');

    expect(day5?.attributes('disabled')).toBeDefined();
    expect(day15?.attributes('disabled')).toBeUndefined();
    expect(day25?.attributes('disabled')).toBeDefined();
  });

  it('handles keyboard navigation with Escape to close', async () => {
    const wrapper = mountPicker();
    const trigger = wrapper.find('[role="combobox"]');

    await trigger.trigger('click');
    expect(trigger.attributes('aria-expanded')).toBe('true');

    await trigger.trigger('keydown', { key: 'Escape' });
    expect(trigger.attributes('aria-expanded')).toBe('false');
  });

  it('adjusts position towards left when trigger is near right screen edge with high z-index', async () => {
    const wrapper = mountPicker({
      attachTo: document.body,
    });
    const trigger = wrapper.find('[role="combobox"]');

    // Mock trigger getBoundingClientRect near right edge of 1024px screen
    vi.spyOn(trigger.element, 'getBoundingClientRect').mockReturnValue({
      left: 800,
      right: 1000,
      top: 200,
      bottom: 236,
      width: 200,
      height: 36,
      x: 800,
      y: 200,
      toJSON: () => {},
    });

    await trigger.trigger('click');

    const popover = wrapper.find('.zonvoir-datepicker-popover');
    expect(popover.exists()).toBe(true);

    const style = popover.attributes('style') || '';
    expect(style).toContain('z-index: 99999');
    expect(style).toContain('position: fixed');

    // Popover width is ~530px; 800 + 530 > 1024 - 16, so it flips to the left:
    // left = 1000 - 530 = 470px
    expect(style).toMatch(/left:\s*4\d\dpx/);
    wrapper.unmount();
  });

  it('renders popover with dark slate classes when darkMode is configured', async () => {
    configureTable({ darkMode: true });
    const wrapper = mountPicker();
    const trigger = wrapper.find('[role="combobox"]');
    await trigger.trigger('click');

    const popover = wrapper.find('.zonvoir-datepicker-popover');
    expect(popover.exists()).toBe(true);
    expect(popover.classes()).toContain('bg-slate-900');
    expect(popover.classes()).toContain('border-slate-800');
    expect(popover.classes()).toContain('dark');
    expect(popover.classes()).not.toContain('bg-white');

    wrapper.unmount();
  });
});

