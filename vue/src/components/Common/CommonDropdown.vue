<script setup lang="ts">
import {
  onBeforeUnmount,
  ref,
  type Ref,
} from 'vue'
import { useFloatingPosition, type FloatingPositionContext } from '../../composables/useFloatingPosition'
import { useTableConfiguration } from '../../config/tableConfig'

interface DropdownProps {
  align?: 'start' | 'end'
  width?: number
  offset?: number
  ariaLabel?: string
}

const props = withDefaults(
  defineProps<DropdownProps>(),
  {
    align: 'end',
    width: 176,
    offset: 6,
    ariaLabel: 'Open menu',
  }
)

const triggerRef: Ref<HTMLElement | null> = ref(null)
const menuRef: Ref<HTMLElement | null> = ref(null)
const open: Ref<boolean> = ref(false)

const tableConfig = useTableConfiguration()
const viewportPadding: number = 8

function getMenuStyle({ triggerRect, floatingRect, viewportWidth, viewportHeight }: FloatingPositionContext): Record<string, string> {
  const spaceLeft: number = triggerRect.left - viewportPadding
  const spaceTop: number = triggerRect.top - viewportPadding
  const spaceBottom: number = viewportHeight - triggerRect.bottom - viewportPadding

  const menuWidth: number = props.width
  const menuHeight: number = floatingRect.height

  let left: number

  if (props.align === 'end') {
    const preferredLeft: number = triggerRect.right - menuWidth

    if (preferredLeft >= viewportPadding && preferredLeft + menuWidth <= viewportWidth - viewportPadding) {
      left = preferredLeft
    } else if (spaceLeft >= menuWidth) {
      left = triggerRect.right - menuWidth
    } else {
      left = triggerRect.left
    }
  } else {
    const preferredLeft: number = triggerRect.left

    if (preferredLeft + menuWidth <= viewportWidth - viewportPadding) {
      left = preferredLeft
    } else if (spaceLeft >= menuWidth) {
      left = triggerRect.right - menuWidth
    } else {
      left = triggerRect.left
    }
  }

  left = Math.max(
    viewportPadding,
    Math.min(left, viewportWidth - menuWidth - viewportPadding)
  )

  let top: number

  if (spaceBottom >= menuHeight + props.offset) {
    top = triggerRect.bottom + props.offset
  } else if (spaceTop >= menuHeight + props.offset) {
    top = triggerRect.top - menuHeight - props.offset
  } else if (spaceBottom >= spaceTop) {
    top = triggerRect.bottom + props.offset
  } else {
    top = triggerRect.top - menuHeight - props.offset
  }

  return {
    position: 'fixed',
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
    width: `${menuWidth}px`,
  }
}

const {
  positionStyle: menuStyle,
  updatePosition,
  addPositionListeners,
  removePositionListeners,
} = useFloatingPosition({
  enabled: open,
  triggerRef,
  floatingRef: menuRef,
  getStyle: getMenuStyle,
  observeSize: true,
})

function close(): void {
  open.value = false
  removeListeners()
}

async function toggle(): Promise<void> {
  if (open.value) {
    close()
    return
  }

  open.value = true
  await updatePosition()
  addListeners()
}

function handlePointerDown(event: PointerEvent): void {
  const target: EventTarget | null = event.target

  if (!(target instanceof Node)) {
    return
  }

  if (triggerRef.value?.contains(target) || menuRef.value?.contains(target)) {
    return
  }

  close()
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') {
    return
  }

  close()
  triggerRef.value?.focus()
}

function addListeners(): void {
  document.addEventListener('pointerdown', handlePointerDown, true)
  document.addEventListener('keydown', handleKeydown)
  addPositionListeners()
}

function removeListeners(): void {
  document.removeEventListener('pointerdown', handlePointerDown, true)
  document.removeEventListener('keydown', handleKeydown)
  removePositionListeners()
}

onBeforeUnmount((): void => {
  removeListeners()
})
</script>

<template>
  <span
    ref="triggerRef"
    class="inline-flex"
  >
    <slot
      name="trigger"
      :open="open"
      :toggle="toggle"
      :close="close"
    >
      <button
        type="button"
        :aria-label="ariaLabel"
        :aria-expanded="open"
        aria-haspopup="menu"
        @click.stop="toggle"
      >
        {{ ariaLabel }}
      </button>
    </slot>
  </span>

  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="scale-95 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-95 opacity-0"
    >
      <div
        v-if="open"
        ref="menuRef"
        role="menu"
        class="zt-dropdown z-[9999] overflow-hidden rounded-lg border py-1 text-left shadow-lg"
        :class="tableConfig.darkMode.enabled
          ? 'border-slate-700 bg-slate-900 text-slate-100'
          : 'border-slate-200 bg-white text-slate-700'"
        :style="menuStyle"
        @click.stop
      >
        <slot :close="close" />
      </div>
    </Transition>
  </Teleport>
</template>
