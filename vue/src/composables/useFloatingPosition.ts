import {
  nextTick,
  onBeforeUnmount,
  ref,
  type Ref,
} from 'vue'

export type FloatingPositionStyle = Record<string, string>

export type FloatingPositionContext = {
  triggerRect: DOMRect
  floatingRect: DOMRect
  viewportWidth: number
  viewportHeight: number
}

export type UseFloatingPositionOptions = {
  enabled: Ref<boolean>
  triggerRef: Ref<HTMLElement | null>
  floatingRef: Ref<HTMLElement | null>
  getStyle: (context: FloatingPositionContext) => FloatingPositionStyle
  observeSize?: boolean
}

export type UseFloatingPositionReturn = {
  positionStyle: Ref<FloatingPositionStyle>
  updatePosition: () => Promise<void>
  addPositionListeners: () => void
  removePositionListeners: () => void
}

export function useFloatingPosition(options: UseFloatingPositionOptions): UseFloatingPositionReturn {
  const positionStyle: Ref<FloatingPositionStyle> = ref({})

  let frame: number | null = null
  let resizeObserver: ResizeObserver | null = null
  let listening = false

  const cancelPendingFrame = (): void => {
    if (frame === null) {
      return
    }

    cancelAnimationFrame(frame)
    frame = null
  }

  const updatePosition = async (): Promise<void> => {
    if (!options.enabled.value) {
      return
    }

    await nextTick()
    cancelPendingFrame()

    frame = requestAnimationFrame((): void => {
      frame = null

      const trigger: HTMLElement | null = options.triggerRef.value
      const floating: HTMLElement | null = options.floatingRef.value

      if (!options.enabled.value || !trigger || !floating) {
        return
      }

      positionStyle.value = options.getStyle({
        triggerRect: trigger.getBoundingClientRect(),
        floatingRect: floating.getBoundingClientRect(),
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      })
    })
  }

  const handleViewportChange = (): void => {
    void updatePosition()
  }

  const addPositionListeners = (): void => {
    if (listening) {
      return
    }

    listening = true
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)

    if (options.observeSize && options.floatingRef.value) {
      resizeObserver = new ResizeObserver(handleViewportChange)
      resizeObserver.observe(options.floatingRef.value)
    }
  }

  const removePositionListeners = (): void => {
    if (!listening) {
      return
    }

    listening = false
    window.removeEventListener('resize', handleViewportChange)
    window.removeEventListener('scroll', handleViewportChange, true)
    resizeObserver?.disconnect()
    resizeObserver = null
    cancelPendingFrame()
  }

  onBeforeUnmount(removePositionListeners)

  return {
    positionStyle,
    updatePosition,
    addPositionListeners,
    removePositionListeners,
  }
}
