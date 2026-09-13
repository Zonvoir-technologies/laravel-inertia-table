import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { vi } from 'vitest';
import CommonDropdown from '../../src/components/Common/CommonDropdown.vue';
import { installTableTestHooks } from '../tableTestUtils';

installTableTestHooks();

const rect = (left: number, top: number, right: number, bottom: number, width: number, height: number): DOMRect =>
  ({ left, top, right, bottom, width, height, x: left, y: top, toJSON: () => ({}) }) as DOMRect;

describe('CommonDropdown branch behavior', () => {
  it('positions start-aligned menus above the trigger when there is no room below', async () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { callback(0); return 1; });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      return this.getAttribute('role') === 'menu'
        ? rect(0, 0, 220, 100, 220, 100)
        : rect(900, 740, 940, 760, 40, 20);
    });
    const wrapper = mount(CommonDropdown, { attachTo: document.body, props: { align: 'start', width: 220, offset: 8 } });

    await wrapper.find('button').trigger('click');
    await nextTick();
    const menu = document.body.querySelector<HTMLElement>('[role="menu"]')!;
    expect(menu.style.left).toBe('720px');
    expect(menu.style.top).toBe('632px');
    await wrapper.find('button').trigger('click');
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
  });

  it('keeps a start-aligned menu inside the left viewport edge and ignores other keys', async () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { callback(0); return 1; });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      return this.getAttribute('role') === 'menu'
        ? rect(0, 0, 300, 100, 300, 100)
        : rect(0, 20, 20, 40, 20, 20);
    });
    const wrapper = mount(CommonDropdown, { attachTo: document.body, props: { align: 'start', width: 300 } });
    await wrapper.find('button').trigger('click');
    await nextTick();
    expect(document.body.querySelector<HTMLElement>('[role="menu"]')!.style.left).toBe('8px');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    await nextTick();
    expect(document.body.querySelector('[role="menu"]')).not.toBeNull();
  });
});