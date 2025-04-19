<template>
  <div>
    <h1>Todos</h1>
    <div v-if="isPending">Loading...</div>
    <div v-else-if="isError">Error: {{ error.message }}</div>
    <ul v-else>
      <li v-for="todo in data" :key="todo.id">
        {{ todo.title }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useQuery } from "@tanstack/vue-query";

// Mock API function
const fetchTodos = async () => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: "Learn Vue 3", completed: false },
        { id: 2, title: "Learn TanStack Query", completed: false },
        { id: 3, title: "Build an app", completed: false },
      ]);
    }, 1000);
  });
};

const { isPending, isError, data, error } = useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
});
</script>
