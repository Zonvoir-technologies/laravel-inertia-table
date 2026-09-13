import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import CommonDropdown from '../../src/components/Common/CommonDropdown.vue';
import CommonTooltip from '../../src/components/Common/CommonTooltip.vue';
import { installTableTestHooks } from '../tableTestUtils';

installTableTestHooks();

describe('common overlays', () => {
  it('opens and closes dropdowns through escape and outside pointer events', async () => {
    const wrapper = mount(CommonDropdown, { attachTo: document.body, slots: { default: 'Menu' } });
    await wrapper.find('button').trigger('click');
    await nextTick();
    expect(document.body.querySelector('[role="menu"]')).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextTick();
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
    await wrapper.find('button').trigger('click');
    document.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    await nextTick();
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
  });

  it('shows enabled tooltips and leaves disabled ones hidden', async () => {
    const frame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { callback(0); return 1; });
    const wrapper = mount(CommonTooltip, { attachTo: document.body, props: { text: 'Help', placement: 'bottom' }, slots: { default: 'Trigger' } });
    await wrapper.find('span').trigger('pointerenter');
    await nextTick();
    expect(document.body.querySelector('[role="tooltip"]')?.textContent).toContain('Help');
    await wrapper.find('span').trigger('pointerleave');
    await nextTick();
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull();
    frame.mockRestore();
  });
  it('does not show a disabled tooltip', async () => {
    const wrapper = mount(CommonTooltip, { attachTo: document.body, props: { text: 'Disabled', disabled: true } });
    await wrapper.find('span').trigger('pointerenter');
    await nextTick();
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('updates visible tooltip positions on scroll and resize, cancelling stale frames', async () => {
    const callbacks: FrameRequestCallback[] = [];
    const request = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callbacks.push(callback);
      return callbacks.length;
    });
    const cancel = vi.spyOn(window, 'cancelAnimationFrame');
    const wrapper = mount(CommonTooltip, { attachTo: document.body, props: { text: 'Help', placement: 'right' } });

    await wrapper.find('span').trigger('pointerenter');
    await nextTick();
    window.dispatchEvent(new Event('scroll'));
    expect(cancel).toHaveBeenCalledWith(1);
    callbacks.at(-1)?.(0);
    await nextTick();
    expect(document.body.querySelector<HTMLElement>('[role="tooltip"]')?.style.left).not.toBe('');

    window.dispatchEvent(new Event('resize'));
    callbacks.at(-1)?.(0);
    await nextTick();
    expect(request).toHaveBeenCalledTimes(3);
  });

  it('abandons a queued position update after the tooltip is hidden', async () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callbacks.push(callback);
      return callbacks.length;
    });
    const wrapper = mount(CommonTooltip, { attachTo: document.body, props: { text: 'Help' } });

    await wrapper.find('span').trigger('pointerenter');
    await nextTick();
    await wrapper.find('span').trigger('pointerleave');
    callbacks[0](0);
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull();
  });
  it('safely skips positioning before the tooltip element is rendered', async () => {
    const wrapper = mount(CommonTooltip, { attachTo: document.body, props: { text: 'Help' } });
    wrapper.find('span').element.dispatchEvent(new Event('pointerenter'));
    window.dispatchEvent(new Event('scroll'));
    await nextTick();
    expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull();
  });
  it('ignores scroll and resize events while hidden', () => {
    mount(CommonTooltip, { attachTo: document.body, props: { text: 'Help' } });
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('resize'));
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull();
  });
});
