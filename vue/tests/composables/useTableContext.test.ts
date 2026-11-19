import type { ComponentInternalInstance } from 'vue';
import { hasCustomActionListener } from '../../src/composables/useTableContext';

const instanceWithProps = (props: Record<string, unknown>): ComponentInternalInstance => ({
  vnode: { props },
} as unknown as ComponentInternalInstance);

describe('useTableContext custom action listeners', () => {
  it.each([
    'onCustomAction',
    'onCustom-action',
    'onCustomActionOnce',
    'onCustom-actionOnce',
  ])('recognizes the %s listener form', (listener) => {
    expect(hasCustomActionListener(instanceWithProps({ [listener]: () => undefined }))).toBe(true);
  });

  it('returns false without a custom action listener', () => {
    expect(hasCustomActionListener(instanceWithProps({ onClick: () => undefined }))).toBe(false);
    expect(hasCustomActionListener(null)).toBe(false);
  });
});
