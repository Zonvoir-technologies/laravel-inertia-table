import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { vi } from 'vitest';
import CommonDropdown from '../../src/components/Common/CommonDropdown.vue';
import { installTableTestHooks } from '../tableTestUtils';

installTableTestHooks();

const rect = (left: number, top: number, right: number, bottom: number, width: number, height: number): DOMRect =>
  ({ left, top, right, bottom, width, height, x: left, y: top, toJSON: () => ({}) }) as DOMRect;

describe('CommonDropdown positioning', () => {
  it('positions its menu after opening and retains pointer events inside the menu', async () => {
    const frame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    const bounds = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      return this.getAttribute('role') === 'menu'
        ? rect(0, 0, 176, 80, 176, 80)
        : rect(900, 600, 940, 620, 40, 20);
    });
    const wrapper = mount(CommonDropdown, {
      attachTo: document.body,
      props: { align: 'end', width: 176, offset: 6 },
      slots: { default: '<button type="button">Keep open</button>' },
    });

    await wrapper.find('button[aria-label="Open menu"]').trigger('click');
    await nextTick();

    const menu = document.body.querySelector<HTMLElement>('[role="menu"]')!;
    expect(menu.style.position).toBe('fixed');
    expect(menu.style.left).not.toBe('');
    expect(menu.style.top).not.toBe('');
    menu.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    await nextTick();
    expect(document.body.querySelector('[role="menu"]')).not.toBeNull();

    frame.mockRestore();
    bounds.mockRestore();
  });
});