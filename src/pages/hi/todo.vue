<script setup lang="ts">
import { store, toDoUndoManger } from '~/composables/store'
import type { Todo } from '~/types'

const newTodo = ref()

function addTodo() {
  const value = newTodo.value && newTodo.value.trim()
  if (!value)
    return

  store.todos.push({
    title: value,
    completed: false,
  })
  newTodo.value = ''
}

function removeTodo(todo: Todo) {
  store.todos.splice(store.todos.indexOf(todo), 1)
}
</script>

<template>
  <main id="app">
    <h1>Todo Vue</h1>
    <input
      v-model="newTodo"
      class="new-todo"
      autofocus
      autocomplete="off"
      placeholder="What needs to be done?"
      @keyup.enter="addTodo"
    >
    <div>
      <button
        btn
        m-r-2
        @click="toDoUndoManger.undo()"
      >
        undo
      </button>
      <button
        btn
        @click="toDoUndoManger.redo()"
      >
        redo
      </button>
    </div>
    <ul class="todo-list">
      <li
        v-for="todo in store.todos"
        :key="todo.title"
        class="todo"
      >
        <div class="view">
          <label>
            <input
              v-model="todo.completed"
              class="toggle"
              type="checkbox"
            >
            {{ todo.title }}
          </label>
          <button
            class="destroy"
            @click="removeTodo(todo)"
          >
            Delete
          </button>
        </div>
      </li>
    </ul>
  </main>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

ul {
  text-align: left;
}

li button {
  margin-left: 1em;
}
</style>

