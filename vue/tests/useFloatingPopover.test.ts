import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, defineComponent, h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { useFloatingPopover } from '../src/composables/useFloatingPopover';

describe('useFloatingPopover composable', () => {
  let triggerEl: HTMLElement;
  let popoverEl: HTMLElement;
  let containerEl: HTMLElement;

  beforeEach(() => {
    triggerEl = document.createElement('button');
    popoverEl = document.createElement('div');
    containerEl = document.createElement('div');
    containerEl.appendChild(triggerEl);
    document.body.appendChild(containerEl);
    document.body.appendChild(popoverEl);

    // Default window dimensions: 1024 x 768
    vi.stubGlobal('innerWidth', 1024);
    vi.stubGlobal('innerHeight', 768);
  });

  afterEach(() => {
    containerEl.remove();
    popoverEl.remove();
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    vi.restoreAllMocks();
  });

  const setupComposable = (options: {
    isOpenInitially?: boolean;
    defaultWidth?: number;
    defaultHeight?: number;
    onClose?: () => void;
  } = {}) => {
    const isOpen = ref(options.isOpenInitially ?? false);
    const triggerRef = ref<HTMLElement | null>(triggerEl);
    const popoverRef = ref<HTMLElement | null>(popoverEl);
    const containerRef = ref<HTMLElement | null>(containerEl);

    let result: ReturnType<typeof useFloatingPopover> | null = null;

    const TestComponent = defineComponent({
      setup() {
        result = useFloatingPopover({
          triggerRef,
          popoverRef,
          containerRef,
          isOpen,
          defaultWidth: options.defaultWidth,
          defaultHeight: options.defaultHeight,
          onClose: options.onClose,
        });
        return () => h('div');
      },
    });

    const wrapper = mount(TestComponent);

    return {
      wrapper,
      isOpen,
      triggerRef,
      popoverRef,
      containerRef,
      result: result!,
    };
  };

  it('initializes with default fixed style and detects window width', () => {
    const { result } = setupComposable();

    expect(result.floatingStyle.value.position).toBe('fixed');
    expect(result.floatingStyle.value.zIndex).toBe('99999');
    expect(result.windowWidth.value).toBe(1024);
    expect(result.isDark.value).toBe(false);
  });

  it('anchors to the left when there is sufficient space on the right', () => {
    const { isOpen, result } = setupComposable({ defaultWidth: 300, defaultHeight: 200 });

    vi.spyOn(triggerEl, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      right: 250,
      top: 100,
      bottom: 140,
      width: 150,
      height: 40,
      x: 100,
      y: 100,
      toJSON: () => {},
    });

    isOpen.value = true;
    result.updatePlacement();

    expect(result.floatingStyle.value.left).toBe('100px');
    expect(result.floatingStyle.value.top).toBe('146px'); // bottom (140) + 6
  });

  it('flips to anchor to the right of the trigger when space on the right is constrained', () => {
    const { isOpen, result } = setupComposable({ defaultWidth: 300, defaultHeight: 200 });

    // Trigger near right edge of 1024px viewport (left: 800, right: 950)
    // 800 + 300 = 1100 > 1024 - 16, so it flips: left = right (950) - width (300) = 650
    vi.spyOn(triggerEl, 'getBoundingClientRect').mockReturnValue({
      left: 800,
      right: 950,
      top: 100,
      bottom: 140,
      width: 150,
      height: 40,
      x: 800,
      y: 100,
      toJSON: () => {},
    });

    isOpen.value = true;
    result.updatePlacement();

    expect(result.floatingStyle.value.left).toBe('650px');
  });

  it('flips upwards when vertical space below is insufficient', () => {
    const { isOpen, result } = setupComposable({ defaultWidth: 300, defaultHeight: 200 });

    // Trigger near bottom of 768px viewport (top: 650, bottom: 690)
    // Space below is 768 - 690 = 78px < 200px, space above is 650px > 78px
    // top = top (650) - height (200) - 6 = 444px
    vi.spyOn(triggerEl, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      right: 250,
      top: 650,
      bottom: 690,
      width: 150,
      height: 40,
      x: 100,
      y: 650,
      toJSON: () => {},
    });

    isOpen.value = true;
    result.updatePlacement();

    expect(result.floatingStyle.value.top).toBe('444px');
  });

  it('clamps left position so it never bleeds past the left edge', () => {
    const { isOpen, result } = setupComposable({ defaultWidth: 300, defaultHeight: 200 });

    vi.spyOn(triggerEl, 'getBoundingClientRect').mockReturnValue({
      left: 5,
      right: 155,
      top: 100,
      bottom: 140,
      width: 150,
      height: 40,
      x: 5,
      y: 100,
      toJSON: () => {},
    });

    isOpen.value = true;
    result.updatePlacement();

    expect(result.floatingStyle.value.left).toBe('16px');
  });

  it('detects dark mode from document or container', async () => {
    const { result, containerRef, isOpen } = setupComposable();
    expect(result.isDark.value).toBe(false);

    document.documentElement.classList.add('dark');
    isOpen.value = true;
    await nextTick();
    expect(result.isDark.value).toBe(true);

    document.documentElement.classList.remove('dark');
    containerRef.value?.classList.add('dark');
    isOpen.value = false;
    await nextTick();
    expect(result.isDark.value).toBe(true);
  });

  it('handles click outside and triggers onClose callback', () => {
    const onClose = vi.fn();
    setupComposable({ isOpenInitially: true, onClose });

    // Click inside container should not close
    containerEl.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(onClose).not.toHaveBeenCalled();

    // Click inside trigger should not close
    triggerEl.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(onClose).not.toHaveBeenCalled();

    // Click inside popover should not close
    popoverEl.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(onClose).not.toHaveBeenCalled();

    // Click outside should call onClose
    const outsideEl = document.createElement('div');
    document.body.appendChild(outsideEl);
    outsideEl.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));

    expect(onClose).toHaveBeenCalledTimes(1);
    outsideEl.remove();
  });

  it('attaches and removes window listeners when isOpen changes', async () => {
    const addEventSpy = vi.spyOn(window, 'addEventListener');
    const removeEventSpy = vi.spyOn(window, 'removeEventListener');

    const { isOpen } = setupComposable();

    isOpen.value = true;
    await nextTick();

    expect(addEventSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(addEventSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true);

    isOpen.value = false;
    await nextTick();

    expect(removeEventSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeEventSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true);
  });

  it('sets parent overflow to visible in ensureParentOverflow for known dropdown classes', () => {
    const parent = document.createElement('div');
    parent.classList.add('zonvoir-filter-popover');
    parent.style.overflow = 'hidden';

    parent.appendChild(containerEl);
    document.body.appendChild(parent);

    const { result } = setupComposable();
    result.ensureParentOverflow();

    expect(parent.style.overflow).toBe('visible');
    parent.remove();
  });
});
