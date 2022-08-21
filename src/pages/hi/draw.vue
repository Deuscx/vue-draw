<script setup lang="ts">
import { useMultiplayer } from '~/composables/useMultiplayer'
import useUsers from '~/composables/useUsers'
import { USER_COLORS, USER_NAMES } from '~/constants'

const random = (arr: string[]): string => {
  return arr[Math.floor(Math.random() * arr.length)]
}

const name = random(USER_NAMES)
const color = random(USER_COLORS)

const { onMount, onChangePage, onUndo, onRedo } = useMultiplayer()
const { room, others } = useUsers({ initPresence: { name, color } })

function onPointerMove(e: PointerEvent) {
  room.updatePresence({
    cursor: {
      x: e.x,
      y: e.y,
    },
  })
}
</script>

<template>
  <div absolute>
    <draw-app
      :on-mount="onMount" :undo="onUndo" :redo="onRedo" @pointermove="onPointerMove"
      @change-page="onChangePage"
    >
      <div
        v-for="{ id, presence } in others" :key="id" absolute
        :style="{ left: `${presence?.cursor?.x || 0}px`, top: `${presence?.cursor?.y || 0}px` }"
      >
        <button i-carbon-cursor-1 :style="{ color: presence.color }" />
        {{ presence.name }}
      </div>
    </draw-app>
  </div>
</template>

<style scoped>
</style>
