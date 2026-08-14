import { ref, watch } from 'vue'

/**
 * Pantau sebuah nilai (getter) dan kembalikan ref yang tertunda (debounce).
 * Berguna untuk input pencarian agar tidak langsung memicu request.
 */
export function useDebouncedValue<T>(source: () => T, delayMs = 300) {
  const value = ref(source())
  let timer: ReturnType<typeof setTimeout> | undefined
  const emptyTimer = () => {
    if (timer) clearTimeout(timer)
    timer = undefined
  }

  watch(source, (next) => {
    emptyTimer()
    timer = setTimeout(() => {
      value.value = next
    }, delayMs)
  })

  return value
}