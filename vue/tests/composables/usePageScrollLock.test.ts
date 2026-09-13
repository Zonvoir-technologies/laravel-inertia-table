import { afterEach, describe, expect, it } from 'vitest';
import { usePageScrollLock } from '../../src/composables/usePageScrollLock';

describe('usePageScrollLock', () => {
  afterEach(() => {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  it('keeps scrolling locked until every consumer has released its lock', () => {
    const originalInnerWidth = window.innerWidth;
    const originalClientWidth = document.documentElement.clientWidth;

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 1180,
    });

    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'scroll';
    document.body.style.paddingRight = '4px';

    const firstLock = usePageScrollLock();
    const secondLock = usePageScrollLock();

    firstLock.lockPageScroll();
    secondLock.lockPageScroll();
    firstLock.unlockPageScroll();

    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.paddingRight).toBe('20px');

    secondLock.unlockPageScroll();

    expect(document.documentElement.style.overflow).toBe('auto');
    expect(document.body.style.overflow).toBe('scroll');
    expect(document.body.style.paddingRight).toBe('4px');

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: originalClientWidth,
    });
  });
});
