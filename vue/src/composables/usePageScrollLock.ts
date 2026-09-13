let pageScrollLockCount = 0
let previousHtmlOverflow = ''
let previousBodyOverflow = ''
let previousBodyPaddingRight = ''

export type UsePageScrollLockReturn = {
  lockPageScroll: () => void
  unlockPageScroll: () => void
}

export function usePageScrollLock(): UsePageScrollLockReturn {
  let hasPageScrollLock = false

  const lockPageScroll = (): void => {
    if (hasPageScrollLock || typeof document === 'undefined') {
      return
    }

    const { documentElement, body } = document

    if (pageScrollLockCount === 0) {
      const scrollbarWidth = window.innerWidth - documentElement.clientWidth

      previousHtmlOverflow = documentElement.style.overflow
      previousBodyOverflow = body.style.overflow
      previousBodyPaddingRight = body.style.paddingRight

      documentElement.style.overflow = 'hidden'
      body.style.overflow = 'hidden'

      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`
      }
    }

    pageScrollLockCount += 1
    hasPageScrollLock = true
  }

  const unlockPageScroll = (): void => {
    if (!hasPageScrollLock || typeof document === 'undefined') {
      return
    }

    pageScrollLockCount = Math.max(0, pageScrollLockCount - 1)
    hasPageScrollLock = false

    if (pageScrollLockCount > 0) {
      return
    }

    document.documentElement.style.overflow = previousHtmlOverflow
    document.body.style.overflow = previousBodyOverflow
    document.body.style.paddingRight = previousBodyPaddingRight
  }

  return {
    lockPageScroll,
    unlockPageScroll,
  }
}
