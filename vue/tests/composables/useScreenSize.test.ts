import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  useScreenSize,
  setScreenSize,
  resetScreenSize,
  defaultBreakpoints,
} from '../../src/composables/useScreenSize';

describe('useScreenSize composable', () => {
  beforeEach(() => {
    resetScreenSize();
  });

  afterEach(() => {
    resetScreenSize();
  });

  it('provides default dimensions and default breakpoints', () => {
    const screenSize = useScreenSize();

    expect(screenSize.width.value).toBe(window.innerWidth);
    expect(screenSize.height.value).toBe(window.innerHeight);
    expect(defaultBreakpoints.sm).toBe(640);
    expect(defaultBreakpoints.md).toBe(768);
    expect(defaultBreakpoints.lg).toBe(1024);
    expect(defaultBreakpoints.xl).toBe(1280);
    expect(defaultBreakpoints['2xl']).toBe(1536);

    screenSize.cleanup();
  });

  it('updates reactively when screen size changes via setScreenSize', () => {
    const screenSize = useScreenSize();

    setScreenSize(500, 800);
    expect(screenSize.width.value).toBe(500);
    expect(screenSize.height.value).toBe(800);
    expect(screenSize.isMobile.value).toBe(true);
    expect(screenSize.isTablet.value).toBe(false);
    expect(screenSize.isDesktop.value).toBe(false);
    expect(screenSize.isLargeScreen.value).toBe(false);
    expect(screenSize.isSmallScreen.value).toBe(true);

    setScreenSize(800, 900);
    expect(screenSize.width.value).toBe(800);
    expect(screenSize.isMobile.value).toBe(false);
    expect(screenSize.isTablet.value).toBe(true);
    expect(screenSize.isDesktop.value).toBe(false);
    expect(screenSize.isLargeScreen.value).toBe(false);

    setScreenSize(1200, 900);
    expect(screenSize.width.value).toBe(1200);
    expect(screenSize.isMobile.value).toBe(false);
    expect(screenSize.isTablet.value).toBe(false);
    expect(screenSize.isDesktop.value).toBe(true);
    expect(screenSize.isLargeScreen.value).toBe(true);
    expect(screenSize.isSmallScreen.value).toBe(false);

    screenSize.cleanup();
  });

  it('handles window resize events properly', () => {
    const screenSize = useScreenSize();

    window.innerWidth = 480;
    window.innerHeight = 800;
    window.dispatchEvent(new Event('resize'));

    expect(screenSize.width.value).toBe(480);
    expect(screenSize.isMobile.value).toBe(true);

    window.innerWidth = 1440;
    window.dispatchEvent(new Event('resize'));

    expect(screenSize.width.value).toBe(1440);
    expect(screenSize.isDesktop.value).toBe(true);
    expect(screenSize.isXl.value).toBe(true);

    screenSize.cleanup();
  });

  it('supports custom largeScreenBreakpoint options as number or key', () => {
    setScreenSize(900);

    // With default lg (1024), 900 is small screen
    const defaultScreen = useScreenSize();
    expect(defaultScreen.isLargeScreen.value).toBe(false);
    defaultScreen.cleanup();

    // With custom md (768), 900 is large screen
    const mdScreen = useScreenSize({ largeScreenBreakpoint: 'md' });
    expect(mdScreen.isLargeScreen.value).toBe(true);
    mdScreen.cleanup();

    // With explicit number threshold (850)
    const numericScreen = useScreenSize({ largeScreenBreakpoint: 850 });
    expect(numericScreen.isLargeScreen.value).toBe(true);
    numericScreen.cleanup();
  });

  it('supports breakpoint comparison helper functions', () => {
    setScreenSize(1024);
    const screenSize = useScreenSize();

    expect(screenSize.greaterOrEqual('lg')).toBe(true);
    expect(screenSize.greaterOrEqual('xl')).toBe(false);
    expect(screenSize.greaterOrEqual(1024)).toBe(true);
    expect(screenSize.greaterOrEqual(1025)).toBe(false);

    expect(screenSize.smaller('xl')).toBe(true);
    expect(screenSize.smaller('lg')).toBe(false);

    expect(screenSize.between('md', 'xl')).toBe(true);
    expect(screenSize.between('sm', 'md')).toBe(false);

    screenSize.cleanup();
  });
});
