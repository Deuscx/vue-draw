<script setup lang="ts">
import { nanoid } from 'nanoid'
import { useMultiplayer } from '~/composables/useMultiplayer'

const { onMount, onChangePage, onUndo, onRedo } = useMultiplayer(nanoid())
</script>

<template>
  <div absolute>
    <draw-app :on-mount="onMount" :undo="onUndo" :redo="onRedo" @change-page="onChangePage" />
  </div>
</template>

<style scoped>
</style>
