import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { CommonButton, CommonBadge } from '../src/index';
import TableFilterButton from '../src/components/TableFilterButton.vue';

describe('TableFilterButton.vue', () => {
  it('renders "Filters" when closed and "Hide filters" when open', () => {
    const wrapperClosed = mount(TableFilterButton, {
      props: {
        open: false,
      },
    });
    expect(wrapperClosed.text()).toBe('Filters');
    expect(wrapperClosed.findComponent(CommonButton).exists()).toBe(true);

    const wrapperOpen = mount(TableFilterButton, {
      props: {
        open: true,
      },
    });
    expect(wrapperOpen.text()).toBe('Hide filters');
    expect(wrapperOpen.findComponent(CommonButton).exists()).toBe(true);
  });

  it('renders active count badge using CommonBadge when activeCount > 0', () => {
    const wrapper = mount(TableFilterButton, {
      props: {
        open: false,
        activeCount: 3,
      },
    });
    expect(wrapper.text()).toContain('3');
    const badge = wrapper.findComponent(CommonBadge);
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe('3');
  });

  it('does not render CommonBadge when activeCount is 0 or undefined', () => {
    const wrapper = mount(TableFilterButton, {
      props: {
        open: false,
        activeCount: 0,
      },
    });
    expect(wrapper.findComponent(CommonBadge).exists()).toBe(false);
  });

  it('emits toggle on button click', async () => {
    const wrapper = mount(TableFilterButton, {
      props: {
        open: false,
      },
    });

    await wrapper.trigger('click');
    expect(wrapper.emitted('toggle')).toBeTruthy();
  });
});

