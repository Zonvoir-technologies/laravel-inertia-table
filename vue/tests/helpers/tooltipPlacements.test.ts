import { clamp, getTooltipCoordinates, tooltipArrowClasses, type TooltipPlacement } from '../../src/helpers/tooltipPlacements';

const rect = (values: Partial<DOMRect>): DOMRect => ({
  x: values.left ?? 0,
  y: values.top ?? 0,
  width: values.width ?? 0,
  height: values.height ?? 0,
  top: values.top ?? 0,
  right: values.right ?? (values.left ?? 0) + (values.width ?? 0),
  bottom: values.bottom ?? (values.top ?? 0) + (values.height ?? 0),
  left: values.left ?? 0,
  toJSON: () => ({})
});

describe('tooltipPlacements', () => {
  const trigger = rect({ top: 100, left: 200, right: 260, bottom: 140, width: 60, height: 40 });
  const tooltip = rect({ width: 80, height: 30 });

  it.each([
    ['top', { top: 62, left: 190 }],
    ['top-start', { top: 62, left: 200 }],
    ['top-end', { top: 62, left: 180 }],
    ['bottom', { top: 148, left: 190 }],
    ['bottom-start', { top: 148, left: 200 }],
    ['bottom-end', { top: 148, left: 180 }],
    ['left', { top: 105, left: 112 }],
    ['left-start', { top: 100, left: 112 }],
    ['left-end', { top: 110, left: 112 }],
    ['right', { top: 105, left: 268 }],
    ['right-start', { top: 100, left: 268 }],
    ['right-end', { top: 110, left: 268 }]
  ] as Array<[TooltipPlacement, { top: number; left: number }]>)('calculates %s coordinates', (placement, expected) => {
    expect(getTooltipCoordinates(placement, trigger, tooltip, 8)).toEqual(expected);
  });

  it('clamps values within the provided range', () => {
    expect(clamp(5, 10, 20)).toBe(10);
    expect(clamp(15, 10, 20)).toBe(15);
    expect(clamp(25, 10, 20)).toBe(20);
  });

  it('defines an arrow class for every placement', () => {
    const placements: TooltipPlacement[] = [
      'top',
      'top-start',
      'top-end',
      'bottom',
      'bottom-start',
      'bottom-end',
      'left',
      'left-start',
      'left-end',
      'right',
      'right-start',
      'right-end'
    ];

    expect(Object.keys(tooltipArrowClasses).sort()).toEqual([...placements].sort());
  });
});