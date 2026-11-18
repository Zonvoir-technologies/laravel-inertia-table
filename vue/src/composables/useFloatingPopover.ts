import { ref, computed, watch, onMounted, onBeforeUnmount, type Ref } from 'vue';

export interface UseFloatingPopoverOptions {
  triggerRef: Ref<HTMLElement | null>;
  popoverRef: Ref<HTMLElement | null>;
  containerRef?: Ref<HTMLElement | null>;
  isOpen: Ref<boolean>;
  defaultWidth?: number;
  defaultHeight?: number;
  onClose?: () => void;
}

interface ExtendedPopoverElement extends HTMLElement {
  __triggerEl?: HTMLElement;
  __parentMenu?: Element;
}

export function useFloatingPopover({
  triggerRef,
  popoverRef,
  containerRef,
  isOpen,
  defaultWidth = 280,
  defaultHeight = 330,
  onClose,
}: UseFloatingPopoverOptions) {
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const floatingStyle = ref<Record<string, string>>({
    position: 'fixed',
    top: '0px',
    left: '0px',
    zIndex: '99999',
  });

  const isDark = computed(() => {
    void isOpen.value;
    if (typeof document === 'undefined') return false;
    return Boolean(
      containerRef?.value?.closest('.dark') ||
      triggerRef.value?.closest('.dark') ||
      containerRef?.value?.closest('[data-dark-mode="enabled"]') ||
      triggerRef.value?.closest('[data-dark-mode="enabled"]') ||
      document.querySelector('[data-dark-mode="enabled"]') ||
      document.documentElement.classList.contains('dark') ||
      document.body.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      document.documentElement.getAttribute('data-mode') === 'dark' ||
      document.body.getAttribute('data-theme') === 'dark' ||
      document.body.getAttribute('data-mode') === 'dark',
    );
  });

  const originalOverflowMap = new Map<HTMLElement, string>();

  const ensureParentOverflow = () => {
    const startEl = containerRef?.value || triggerRef.value;
    if (!startEl) return;
    let el: HTMLElement | null = startEl.parentElement;
    while (el && el !== document.body) {
      if (el.classList.contains('zt-dropdown') || el.classList.contains('zonvoir-filter-popover')) {
        if (!originalOverflowMap.has(el)) {
          originalOverflowMap.set(el, el.style.overflow);
        }
        el.style.overflow = 'visible';
      }
      el = el.parentElement;
    }
  };

  const restoreParentOverflow = () => {
    originalOverflowMap.forEach((originalOverflow, el) => {
      el.style.overflow = originalOverflow;
    });
    originalOverflowMap.clear();
  };

  const updatePlacement = () => {
    if (!triggerRef.value || typeof window === 'undefined') return;
    const triggerRect = triggerRef.value.getBoundingClientRect();
    const popoverEl = popoverRef.value;

    const width = popoverEl?.offsetWidth || defaultWidth;
    const height = popoverEl?.offsetHeight || defaultHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Horizontal calculation:
    // Default to aligning with the left edge of the trigger
    let left = triggerRect.left;

    // If opening to the right overflows the viewport (e.g. in right-side filter drawer/panel):
    // Open towards the left, aligning the right edge of the popover with the right edge of the trigger!
    if (left + width > viewportWidth - 16) {
      left = triggerRect.right - width;
    }

    // Ensure it never bleeds off the left edge of the screen
    if (left < 16) {
      left = Math.max(16, Math.min(triggerRect.left, viewportWidth - width - 16));
    }

    // Vertical calculation:
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    let top = triggerRect.bottom + 6;

    // If space below is not enough and there's more space above, open upwards
    if (spaceBelow < height && spaceAbove > spaceBelow) {
      top = Math.max(16, triggerRect.top - height - 6);
    }

    floatingStyle.value = {
      position: 'fixed',
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      zIndex: '99999',
      maxWidth: 'calc(100vw - 32px)',
    };
  };

  let positionListenersAttached = false;
  const handlePositionUpdate = () => {
    if (typeof window !== 'undefined') {
      windowWidth.value = window.innerWidth;
    }
    if (isOpen.value) {
      updatePlacement();
    }
  };

  const addPositionListeners = () => {
    if (positionListenersAttached || typeof window === 'undefined') return;
    positionListenersAttached = true;
    window.addEventListener('resize', handlePositionUpdate);
    window.addEventListener('scroll', handlePositionUpdate, true);
  };

  const removePositionListeners = () => {
    if (!positionListenersAttached || typeof window === 'undefined') return;
    positionListenersAttached = false;
    window.removeEventListener('resize', handlePositionUpdate);
    window.removeEventListener('scroll', handlePositionUpdate, true);
  };

  const handleDocumentClick = (event: MouseEvent | PointerEvent) => {
    if (!isOpen.value) return;
    const target = event.target as Node | null;
    if (!target) return;
    if (
      containerRef?.value?.contains(target) ||
      triggerRef.value?.contains(target) ||
      popoverRef.value?.contains(target)
    ) {
      return;
    }
    onClose?.();
  };

  const updateParentLinks = () => {
    if (popoverRef.value && triggerRef.value) {
      const el = popoverRef.value as ExtendedPopoverElement;
      el.__triggerEl = triggerRef.value;
      const parentMenu = triggerRef.value.closest('.zt-dropdown');
      if (parentMenu) {
        el.__parentMenu = parentMenu;
      }
    }
  };

  watch(isOpen, (val) => {
    if (val) {
      if (typeof window !== 'undefined') {
        windowWidth.value = window.innerWidth;
      }
      ensureParentOverflow();
      updatePlacement();
      setTimeout(() => {
        updatePlacement();
        updateParentLinks();
      }, 0);
      addPositionListeners();
    } else {
      restoreParentOverflow();
      removePositionListeners();
    }
  });

  onMounted(() => {
    document.addEventListener('pointerdown', handleDocumentClick, true);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', handleDocumentClick, true);
    restoreParentOverflow();
    removePositionListeners();
  });

  return {
    windowWidth,
    floatingStyle,
    isDark,
    updatePlacement,
    addPositionListeners,
    removePositionListeners,
    ensureParentOverflow,
    restoreParentOverflow,
  };
}
