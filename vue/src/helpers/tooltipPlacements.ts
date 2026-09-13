export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'

export type TooltipCoordinates = {
  top: number
  left: number
}

type PlacementResolver = (trigger: DOMRect, tooltip: DOMRect, offset: number) => TooltipCoordinates

const placementResolvers: Record<TooltipPlacement, PlacementResolver> = {
  bottom: (trigger, tooltip, offset) => ({
    top: trigger.bottom + offset,
    left: trigger.left + trigger.width / 2 - tooltip.width / 2,
  }),
  'bottom-start': (trigger, _tooltip, offset) => ({
    top: trigger.bottom + offset,
    left: trigger.left,
  }),
  'bottom-end': (trigger, tooltip, offset) => ({
    top: trigger.bottom + offset,
    left: trigger.right - tooltip.width,
  }),
  left: (trigger, tooltip, offset) => ({
    top: trigger.top + trigger.height / 2 - tooltip.height / 2,
    left: trigger.left - tooltip.width - offset,
  }),
  'left-start': (trigger, tooltip, offset) => ({
    top: trigger.top,
    left: trigger.left - tooltip.width - offset,
  }),
  'left-end': (trigger, tooltip, offset) => ({
    top: trigger.bottom - tooltip.height,
    left: trigger.left - tooltip.width - offset,
  }),
  right: (trigger, tooltip, offset) => ({
    top: trigger.top + trigger.height / 2 - tooltip.height / 2,
    left: trigger.right + offset,
  }),
  'right-start': (trigger, _tooltip, offset) => ({
    top: trigger.top,
    left: trigger.right + offset,
  }),
  'right-end': (trigger, tooltip, offset) => ({
    top: trigger.bottom - tooltip.height,
    left: trigger.right + offset,
  }),
  top: (trigger, tooltip, offset) => ({
    top: trigger.top - tooltip.height - offset,
    left: trigger.left + trigger.width / 2 - tooltip.width / 2,
  }),
  'top-start': (trigger, tooltip, offset) => ({
    top: trigger.top - tooltip.height - offset,
    left: trigger.left,
  }),
  'top-end': (trigger, tooltip, offset) => ({
    top: trigger.top - tooltip.height - offset,
    left: trigger.right - tooltip.width,
  }),
}

export const tooltipArrowClasses: Record<TooltipPlacement, string> = {
  bottom: 'left-1/2 -top-1 -translate-x-1/2',
  'bottom-start': 'left-1/2 -top-1 -translate-x-1/2',
  'bottom-end': 'left-1/2 -top-1 -translate-x-1/2',
  left: 'top-1/2 -right-1 -translate-y-1/2',
  'left-start': 'top-1/2 -right-1 -translate-y-1/2',
  'left-end': 'top-1/2 -right-1 -translate-y-1/2',
  right: 'top-1/2 -left-1 -translate-y-1/2',
  'right-start': 'top-1/2 -left-1 -translate-y-1/2',
  'right-end': 'top-1/2 -left-1 -translate-y-1/2',
  top: 'left-1/2 -bottom-1 -translate-x-1/2',
  'top-start': 'left-1/2 -bottom-1 -translate-x-1/2',
  'top-end': 'left-1/2 -bottom-1 -translate-x-1/2',
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max))
}

export function getTooltipCoordinates(
  placement: TooltipPlacement,
  trigger: DOMRect,
  tooltip: DOMRect,
  offset: number,
): TooltipCoordinates {
  return placementResolvers[placement](trigger, tooltip, offset)
}
