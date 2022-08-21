import type { MaybeRef } from '@vueuse/core'
import type { UnwrapRef } from 'vue'

export default function useState<T>(init: MaybeRef<T>) {
  const state = ref(init)
  function updateState(value: UnwrapRef<T>) {
    state.value = value
  }

  return [state, updateState] as const
}
