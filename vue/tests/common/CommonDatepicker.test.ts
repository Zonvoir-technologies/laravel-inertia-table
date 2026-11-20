import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, type ComponentMountingOptions } from '@vue/test-utils';
import CommonDatepicker from '../../src/components/Common/CommonDatepicker.vue';
import { configureTable, resetTableConfiguration } from '../../src/config/tableConfig';

const mountPicker = (options: ComponentMountingOptions<typeof CommonDatepicker> = {}) => {
  return mount(CommonDatepicker, {
    ...options,
    global: {
      stubs: {
        teleport: true,
      },
      ...options.global,
    },
  });
};

describe('CommonDatepicker component', () => {
  afterEach(() => {
    resetTableConfiguration();
  });
  it('renders closed initially and displays placeholder', () => {
    const wrapper = mountPicker({
      props: {
        placeholder: 'Select a date...',
      },
    });

    expect(wrapper.text()).toContain('Select a date...');
    expect(wrapper.find('[role="combobox"]').attributes('aria-expanded')).toBe('false');
    expect(wrapper.find('.zonvoir-common-datepicker').exists()).toBe(true);
  });

  it('opens and closes popover on trigger click', async () => {
    const wrapper = mountPicker({
      props: {
        modelValue: '2026-09-23',
      },
    });

    const trigger = wrapper.find('[role="combobox"]');
    await trigger.trigger('click');

    expect(trigger.attributes('aria-expanded')).toBe('true');
    expect(wrapper.find('select').exists()).toBe(true);

    // Click again to close
    await trigger.trigger('click');
    expect(trigger.attributes('aria-expanded')).toBe('false');
  });

  it('displays formatted date and highlights selected day', async () => {
    const wrapper = mountPicker({
      props: {
        modelValue: '2026-09-23',
      },
    });

    expect(wrapper.text()).toContain('Sep 23, 2026');

    // Open popup
    await wrapper.find('[role="combobox"]').trigger('click');

    // Find the button for day 23
    const buttons = wrapper.findAll('button');
    const day23 = buttons.find((b) => b.text() === '23');
    expect(day23).toBeDefined();
    expect(day23?.classes()).toContain('font-semibold');
  });

  it('selects a date when a day cell is clicked', async () => {
    const wrapper = mountPicker({
      props: {
        modelValue: '2026-09-23',
      },
    });

    await wrapper.find('[role="combobox"]').trigger('click');

    // Find button for day 15
    const buttons = wrapper.findAll('button');
    const day15 = buttons.find((b) => b.text() === '15');
    expect(day15).toBeDefined();

    await day15?.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-09-15']);
  });

  it('navigates months with previous and next buttons', async () => {
    const wrapper = mountPicker({
      props: {
        modelValue: '2026-09-23',
      },
    });

    await wrapper.find('[role="combobox"]').trigger('click');

    // Month select should be Sep (index 8)
    const monthSelect = wrapper.find('select');
    expect(monthSelect.element.value).toBe('8');

    // Click previous month button
    const prevBtn = wrapper.find('button[aria-label="Previous month"]');
    await prevBtn.trigger('click');
    expect(wrapper.find('select').element.value).toBe('7'); // Aug

    // Click next month button twice
    const nextBtn = wrapper.find('button[aria-label="Next month"]');
    await nextBtn.trigger('click');
    await nextBtn.trigger('click');
    expect(wrapper.find('select').element.value).toBe('9'); // Oct
  });

  it('supports time selection (12h format with AM/PM)', async () => {
    const wrapper = mountPicker({
      props: {
        modelValue: '2026-09-23 14:30:00',
        enableTime: true,
        time24h: false,
      },
    });

    expect(wrapper.text()).toContain('Sep 23, 2026 2:30 PM');

    await wrapper.find('[role="combobox"]').trigger('click');

    // Time section exists
    expect(wrapper.text()).toContain('Time');
    expect(wrapper.text()).toContain('PM');

    // Toggle AM/PM
    const amPmBtn = wrapper.findAll('button').find((b) => b.text() === 'PM');
    expect(amPmBtn).toBeDefined();
    await amPmBtn?.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    const lastEmit = wrapper.emitted('update:modelValue')!.slice(-1)[0][0] as string;
    expect(lastEmit).toContain('02:30:00');
  });

  it('supports 24h format time selection', async () => {
    const wrapper = mountPicker({
      props: {
        modelValue: '2026-09-23 18:45:00',
        enableTime: true,
        time24h: true,
      },
    });

    expect(wrapper.text()).toContain('Sep 23, 2026 18:45');
    await wrapper.find('[role="combobox"]').trigger('click');

    // Should not have AM/PM button
    expect(wrapper.text()).not.toContain('AM');
    expect(wrapper.text()).not.toContain('PM');
  });

  it('handles presets shortcuts', async () => {
    const wrapper = mountPicker({
      props: {
        modelValue: '2026-09-23',
        presets: [
          { label: 'Today', value: '2026-09-23' },
          { label: 'Yesterday', value: '2026-09-22' },
        ],
      },
    });

    await wrapper.find('[role="combobox"]').trigger('click');

    expect(wrapper.text()).toContain('Presets');
    const yesterdayBtn = wrapper.findAll('button').find((b) => b.text() === 'Yesterday');
    expect(yesterdayBtn).toBeDefined();

    await yesterdayBtn?.trigger('click');

    expect(wrapper.emitted('presetSelect')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-09-22']);
  });

  it('disables dates outside minDate and maxDate', async () => {
    const wrapper = mountPicker({
      props: {
        modelValue: '2026-09-23',
        minDate: '2026-09-20',
        maxDate: '2026-09-25',
      },
    });

    await wrapper.find('[role="combobox"]').trigger('click');

    const day10 = wrapper.findAll('button').find((b) => b.text() === '10');
    expect(day10?.attributes('disabled')).toBeDefined();

    const day22 = wrapper.findAll('button').find((b) => b.text() === '22');
    expect(day22?.attributes('disabled')).toBeUndefined();
  });

  it('supports multiple months and week numbers', async () => {
    const wrapper = mountPicker({
      props: {
        modelValue: '2026-09-23',
        numberOfMonths: 2,
        showWeekNumbers: true,
      },
    });

    await wrapper.find('[role="combobox"]').trigger('click');

    // Header has week number indicator '#'
    expect(wrapper.text()).toContain('#');

    // 2 months displayed
    const selects = wrapper.findAll('select');
    expect(selects.length).toBeGreaterThanOrEqual(4); // 2 month selects + 2 year selects
  });

  it('clears date with clear button', async () => {
    const wrapper = mountPicker({
      props: {
        modelValue: '2026-09-23',
        clearable: true,
      },
    });

    const clearBtn = wrapper.find('button[aria-label="Clear date"]');
    expect(clearBtn.exists()).toBe(true);

    await clearBtn.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['']);
  });

  it('synchronizes with hidden native input', async () => {
    const wrapper = mountPicker({
      props: {
        modelValue: '2026-09-23',
        ariaLabel: 'Filter date',
      },
    });

    const nativeInput = wrapper.find('input[type="date"]');
    expect(nativeInput.exists()).toBe(true);
    expect(nativeInput.attributes('aria-label')).toBe('Filter date');
    expect((nativeInput.element as HTMLInputElement).value).toBe('2026-09-23');

    // Native input change
    await nativeInput.setValue('2026-09-28');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-09-28']);
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

    // Popover width is ~280px; 800 + 280 > 1024 - 16, so it flips to the left:
    // left = 1000 - 280 = 720px
    expect(style).toMatch(/left:\s*7\d\dpx/);
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
