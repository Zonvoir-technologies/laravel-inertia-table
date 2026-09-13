import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import { useFloatingPosition } from '../../src/composables/useFloatingPosition';

describe('useFloatingPosition', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback): number => {
      return window.setTimeout(() => callback(performance.now()), 0);
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number): void => clearTimeout(id));
    globalThis.ResizeObserver = class ResizeObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    } as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const Harness = defineComponent({
    setup() {
      const enabled = ref(false);
      const triggerRef = ref<HTMLElement | null>(null);
      const floatingRef = ref<HTMLElement | null>(null);
      const getStyle = vi.fn(() => ({ top: '10px', left: '20px' }));
      const floating = useFloatingPosition({
        enabled,
        triggerRef,
        floatingRef,
        getStyle,
        observeSize: true
      });

      return {
        enabled,
        floating,
        floatingRef,
        getStyle,
        triggerRef
      };
    },
    template: '<div><button ref="triggerRef">Trigger</button><div ref="floatingRef">Menu</div></div>'
  });

  it('does not calculate positions while disabled', async () => {
    const wrapper = mount(Harness, { attachTo: document.body });

    await wrapper.vm.floating.updatePosition();
    vi.runAllTimers();

    expect(wrapper.vm.getStyle).not.toHaveBeenCalled();
    expect(wrapper.vm.floating.positionStyle.value).toEqual({});
  });

  it('calculates position style from trigger floating and viewport rectangles', async () => {
    const wrapper = mount(Harness, { attachTo: document.body });
    const trigger = wrapper.vm.triggerRef!;
    const floating = wrapper.vm.floatingRef!;

    trigger.getBoundingClientRect = vi.fn(() => ({ top: 1, right: 2, bottom: 3, left: 4, width: 5, height: 6, x: 4, y: 1, toJSON: () => ({}) }));
    floating.getBoundingClientRect = vi.fn(() => ({ top: 7, right: 8, bottom: 9, left: 10, width: 11, height: 12, x: 10, y: 7, toJSON: () => ({}) }));
    wrapper.vm.enabled = true;

    await wrapper.vm.floating.updatePosition();
    await nextTick();
    vi.runAllTimers();

    expect(wrapper.vm.getStyle).toHaveBeenCalledWith(expect.objectContaining({
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight
    }));
    expect(wrapper.vm.floating.positionStyle.value).toEqual({ top: '10px', left: '20px' });
  });

  it('adds and removes viewport listeners around positioning', () => {
    const addListener = vi.spyOn(window, 'addEventListener');
    const removeListener = vi.spyOn(window, 'removeEventListener');
    const wrapper = mount(Harness, { attachTo: document.body });

    wrapper.vm.floating.addPositionListeners();
    wrapper.vm.floating.addPositionListeners();
    wrapper.vm.floating.removePositionListeners();

    expect(addListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(addListener).toHaveBeenCalledWith('scroll', expect.any(Function), true);
    expect(removeListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeListener).toHaveBeenCalledWith('scroll', expect.any(Function), true);
  });
});