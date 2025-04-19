<template>
  <div class="search-container">
    <div class="search-wrapper">
      <span class="search-icon">🔍</span>
      <input
        v-model="searchTerm"
        placeholder="Search"
        class="search-input"
        @input="handleSearch"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useTaskStore } from "~/stores/taskStore";

const taskStore = useTaskStore();
const searchTerm = ref("");

const handleSearch = () => {
  taskStore.setSearchQuery(searchTerm.value);
};

// Watch for changes in search term
watch(
  () => searchTerm.value,
  (newVal) => {
    taskStore.setSearchQuery(newVal);
  }
);
</script>

<style scoped>
.search-container {
  width: 200px;
}

.search-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 8px 8px 8px 32px;
  border-radius: 4px;
  border: 1px solid #4a5568;
  background-color: #2d3748;
  color: white;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}
</style>
