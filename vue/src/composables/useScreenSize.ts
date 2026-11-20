import {
  ref,
  computed,
  isRef,
  onUnmounted,
  getCurrentInstance,
  type Ref,
  type ComputedRef,
} from 'vue';

export type ScreenBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export const defaultBreakpoints: Record<ScreenBreakpoint, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export type UseScreenSizeOptions = {
  breakpoints?: Partial<Record<ScreenBreakpoint, number>> & Record<string, number>;
  largeScreenBreakpoint?:
    | ScreenBreakpoint
    | number
    | Ref<ScreenBreakpoint | number>
    | (() => ScreenBreakpoint | number);
  defaultWidth?: number;
  defaultHeight?: number;
};

export type UseScreenSizeReturn = {
  width: Ref<number>;
  height: Ref<number>;
  isMobile: ComputedRef<boolean>;
  isTablet: ComputedRef<boolean>;
  isDesktop: ComputedRef<boolean>;
  isLargeScreen: ComputedRef<boolean>;
  isSmallScreen: ComputedRef<boolean>;
  isSm: ComputedRef<boolean>;
  isMd: ComputedRef<boolean>;
  isLg: ComputedRef<boolean>;
  isXl: ComputedRef<boolean>;
  is2Xl: ComputedRef<boolean>;
  greaterOrEqual: (breakpoint: ScreenBreakpoint | number) => boolean;
  smaller: (breakpoint: ScreenBreakpoint | number) => boolean;
  between: (min: ScreenBreakpoint | number, max: ScreenBreakpoint | number) => boolean;
  cleanup: () => void;
};

let sharedListenerCount = 0;
const sharedWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);
const sharedHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 768);

const updateSharedDimensions = (): void => {
  if (typeof window !== 'undefined') {
    sharedWidth.value = window.innerWidth;
    sharedHeight.value = window.innerHeight;
  }
};

const setupSharedListener = (): void => {
  if (typeof window === 'undefined') return;
  if (sharedListenerCount === 0) {
    updateSharedDimensions();
    window.addEventListener('resize', updateSharedDimensions, { passive: true });
    window.addEventListener('orientationchange', updateSharedDimensions, { passive: true });
  }
  sharedListenerCount++;
};

const removeSharedListener = (): void => {
  if (typeof window === 'undefined') return;
  sharedListenerCount = Math.max(0, sharedListenerCount - 1);
  if (sharedListenerCount === 0) {
    window.removeEventListener('resize', updateSharedDimensions);
    window.removeEventListener('orientationchange', updateSharedDimensions);
  }
};

/**
 * Manually set the screen size (useful for unit tests or SSR emulation).
 */
export const setScreenSize = (width: number, height = 768): void => {
  sharedWidth.value = width;
  sharedHeight.value = height;
  if (typeof window !== 'undefined') {
    try {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
      Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: height });
    } catch {
      // In some environments, innerWidth might not be re-definable
    }
  }
};

/**
 * Reset the screen size back to window values or defaults.
 */
export const resetScreenSize = (): void => {
  if (typeof window !== 'undefined') {
    sharedWidth.value = window.innerWidth;
    sharedHeight.value = window.innerHeight;
  } else {
    sharedWidth.value = 1024;
    sharedHeight.value = 768;
  }
};

/**
 * Composable that tracks window dimensions and provides responsive breakpoint utilities.
 */
export function useScreenSize(options: UseScreenSizeOptions = {}): UseScreenSizeReturn {
  if (typeof window !== 'undefined' && sharedListenerCount === 0) {
    updateSharedDimensions();
  }

  let isSubscribed = false;

  const subscribe = (): void => {
    if (!isSubscribed) {
      setupSharedListener();
      isSubscribed = true;
    }
  };

  const unsubscribe = (): void => {
    if (isSubscribed) {
      removeSharedListener();
      isSubscribed = false;
    }
  };

  subscribe();

  if (getCurrentInstance()) {
    onUnmounted(() => {
      unsubscribe();
    });
  }

  const mergedBreakpoints: Record<string, number> = {
    ...defaultBreakpoints,
    ...(options.breakpoints ?? {}),
  };

  const resolveBreakpointValue = (bp: ScreenBreakpoint | number): number => {
    if (typeof bp === 'number') {
      return bp;
    }
    return mergedBreakpoints[bp] ?? defaultBreakpoints[bp as ScreenBreakpoint] ?? 0;
  };

  const getLargeThreshold = (): number => {
    const raw =
      typeof options.largeScreenBreakpoint === 'function'
        ? options.largeScreenBreakpoint()
        : isRef(options.largeScreenBreakpoint)
          ? options.largeScreenBreakpoint.value
          : options.largeScreenBreakpoint;

    if (raw !== undefined && raw !== null) {
      return resolveBreakpointValue(raw);
    }
    return mergedBreakpoints.lg ?? 1024;
  };

  const isLargeScreen = computed((): boolean => sharedWidth.value >= getLargeThreshold());
  const isSmallScreen = computed((): boolean => sharedWidth.value < getLargeThreshold());

  const isSm = computed((): boolean => sharedWidth.value >= (mergedBreakpoints.sm ?? 640));
  const isMd = computed((): boolean => sharedWidth.value >= (mergedBreakpoints.md ?? 768));
  const isLg = computed((): boolean => sharedWidth.value >= (mergedBreakpoints.lg ?? 1024));
  const isXl = computed((): boolean => sharedWidth.value >= (mergedBreakpoints.xl ?? 1280));
  const is2Xl = computed((): boolean => sharedWidth.value >= (mergedBreakpoints['2xl'] ?? 1536));

  const isMobile = computed((): boolean => sharedWidth.value < (mergedBreakpoints.md ?? 768));
  const isTablet = computed(
    (): boolean =>
      sharedWidth.value >= (mergedBreakpoints.md ?? 768) &&
      sharedWidth.value < (mergedBreakpoints.lg ?? 1024),
  );
  const isDesktop = computed((): boolean => sharedWidth.value >= (mergedBreakpoints.lg ?? 1024));

  const greaterOrEqual = (bp: ScreenBreakpoint | number): boolean => {
    return sharedWidth.value >= resolveBreakpointValue(bp);
  };

  const smaller = (bp: ScreenBreakpoint | number): boolean => {
    return sharedWidth.value < resolveBreakpointValue(bp);
  };

  const between = (min: ScreenBreakpoint | number, max: ScreenBreakpoint | number): boolean => {
    return (
      sharedWidth.value >= resolveBreakpointValue(min) &&
      sharedWidth.value < resolveBreakpointValue(max)
    );
  };

  return {
    width: sharedWidth,
    height: sharedHeight,
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    isSmallScreen,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    greaterOrEqual,
    smaller,
    between,
    cleanup: unsubscribe,
  };
}
