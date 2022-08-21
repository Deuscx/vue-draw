<script setup lang="ts">
const router = useRouter()
const routerName = ['todo', 'draw']
function go(path: string) {
  router.push(`/hi/${encodeURIComponent(path)}`)
}
</script>

<template>
  <div>
    <button
      v-for="name in routerName"
      :key="name"
      class="m-3 text-sm btn"
      :disabled="!name"
      @click="go(name)"
    >
      Go to {{ name }}
    </button>
  </div>
</template>
