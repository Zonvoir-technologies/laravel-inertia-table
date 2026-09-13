<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  type ComputedRef,
  type Ref,
} from 'vue'
import {
  clamp,
  getTooltipCoordinates,
  tooltipArrowClasses,
  type TooltipCoordinates,
  type TooltipPlacement,
} from '../../helpers/tooltipPlacements'

interface TooltipProps {
  text?: string
  placement?: TooltipPlacement
  offset?: number
  disabled?: boolean
}

const props = withDefaults(
  defineProps<TooltipProps>(),
  {
    text: '',
    placement: 'top',
    offset: 8,
    disabled: false,
  },
)

const visible: Ref<boolean> = ref(false)
const triggerRef: Ref<HTMLElement | null> = ref(null)
const tooltipRef: Ref<HTMLElement | null> = ref(null)
const positionStyle: Ref<Record<string, string>> = ref({})

const tooltipId: string = `zt-tooltip-${Math.random()
  .toString(36)
  .substring(2, 10)}`

let frame: number | null = null

const updatePosition = (): void => {
  if (!visible.value || !triggerRef.value || !tooltipRef.value) {
    return
  }

  if (frame !== null) {
    cancelAnimationFrame(frame)
  }

  frame = requestAnimationFrame((): void => {
    frame = null

    if (!visible.value || !triggerRef.value || !tooltipRef.value) {
      return
    }

    const trigger: DOMRect = triggerRef.value.getBoundingClientRect()
    const tooltip: DOMRect = tooltipRef.value.getBoundingClientRect()
    const padding: number = 8
    const coordinates: TooltipCoordinates = getTooltipCoordinates(props.placement, trigger, tooltip, props.offset)

    positionStyle.value = {
      top: `${clamp(coordinates.top, padding, window.innerHeight - tooltip.height - padding)}px`,
      left: `${clamp(coordinates.left, padding, window.innerWidth - tooltip.width - padding)}px`,
    }
  })
}

const show = async (): Promise<void> => {
  if (props.disabled) {
    return
  }

  visible.value = true

  await nextTick()

  updatePosition()
}

const hide = (): void => {
  visible.value = false
}

const handleScroll = (): void => {
  if (visible.value) {
    updatePosition()
  }
}

const handleResize = (): void => {
  if (visible.value) {
    updatePosition()
  }
}

const arrowClass: ComputedRef<string> = computed((): string => tooltipArrowClasses[props.placement])

onBeforeUnmount((): void => {
  if (frame !== null) {
    cancelAnimationFrame(frame)
  }

  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', handleResize)
})

window.addEventListener('scroll', handleScroll, true)
window.addEventListener('resize', handleResize)
</script>

<template>
  <span
    ref="triggerRef"
    class="inline-flex"
    @pointerenter="show"
    @pointerleave="hide"
  >
    <slot />
  </span>

  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="visible"
        ref="tooltipRef"
        :id="tooltipId"
        role="tooltip"
        class="pointer-events-none fixed z-[9999] max-w-60 rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs leading-snug text-zinc-50 shadow-lg"
        :style="positionStyle"
      >
        <slot name="content">
          {{ text }}
        </slot>

        <div
          class="absolute h-2 w-2 rotate-45 bg-zinc-900"
          :class="arrowClass"
        />
      </div>
    </Transition>
  </Teleport>
</template>
