<template>
  <NuxtLayout>
    <NuxtPage />
    <TaskLayout />
  </NuxtLayout>
</template>

<script setup>
import TaskLayout from "~/components/TaskLayout.vue";
useHead({
  title: "Task Manager",
  meta: [{ name: "description", content: "Task Manager application" }],
  link: [
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/icon?family=Material+Icons",
    },
  ],
});
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  background-color: #0f172a;
  color: #f8fafc;
  height: 100%;
}

* {
  box-sizing: border-box;
}
</style>
