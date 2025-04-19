<template>
  <div>
    <button @click="openModal" class="custom-button">
      <span class="plus-icon">+</span>
      New task
    </button>

    <TaskModal
      v-show="showModal"
      v-model:show="showModal"
      @task-created="onTaskCreated"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import TaskModal from "~/components/TaskModal.vue";

const showModal = ref(false);

const openModal = () => {
  console.log("Opening new task modal");
  showModal.value = true;
  console.log("showModal set to:", showModal.value);
};

const onTaskCreated = (newTask) => {
  // Any additional logic after task creation can go here
  console.log("Task created:", newTask);
};
</script>

<style scoped>
.custom-button {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.custom-button:hover {
  background-color: #2563eb;
}

.plus-icon {
  margin-right: 6px;
  font-weight: bold;
  font-size: 16px;
}
</style>
