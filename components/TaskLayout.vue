<template>
  <div class="task-layout">
    <div class="header">
      <div class="tabs">
        <UButton
          variant="ghost"
          color="gray"
          class="tab-btn"
          :class="{ 'bg-gray-800': activeView === 'table' }"
          @click="setActiveView('table')"
        >
          <template #leading>
            <UIcon name="i-heroicons-table-cells" class="text-lg" />
          </template>
          Main Table
        </UButton>
        <UButton
          variant="ghost"
          color="gray"
          class="tab-btn"
          :class="{ 'bg-gray-800': activeView === 'kanban' }"
          @click="setActiveView('kanban')"
        >
          <template #leading>
            <UIcon name="i-heroicons-view-columns" class="text-lg" />
          </template>
          Kanban
        </UButton>
        <div class="tab-spacer"></div>
        <div v-if="isLoading" class="loading-indicator">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin mr-2" />
          <span>Loading...</span>
        </div>
      </div>
    </div>

    <UAlert
      v-if="error"
      color="red"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      class="mx-4 mt-4"
    >
      <p class="text-sm">{{ error }}</p>
      <template #actions>
        <UButton
          color="red"
          variant="ghost"
          size="xs"
          @click="fetchTasksManually"
          icon="i-heroicons-arrow-path"
        >
          Retry
        </UButton>
      </template>
    </UAlert>

    <UAlert
      color="blue"
      variant="soft"
      icon="i-heroicons-information-circle"
      class="mx-4 mt-4"
    >
      <p class="text-sm">
        Due to CORS limitations, all changes (create, update, delete) are stored
        in memory only and will be lost on page refresh.
      </p>
    </UAlert>

    <div class="controls">
      <div class="left-controls">
        <NewTaskButton />
        <SearchBox />
        <PersonFilter />
        <SortButton />
      </div>
    </div>

    <div class="content">
      <TaskTable v-if="activeView === 'table'" />
      <KanbanBoard v-else />
    </div>
  </div>
</template>

<script setup>
import { useTaskStore } from "~/stores/taskStore";
import { onMounted, computed, ref, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { fetchTasks } from "~/services/taskApi";
import TaskTable from "~/components/TaskTable.vue";
import KanbanBoard from "~/components/KanbanBoard.vue";
import NewTaskButton from "~/components/NewTaskButton.vue";
import SearchBox from "~/components/SearchBox.vue";
import PersonFilter from "~/components/PersonFilter.vue";
import SortButton from "~/components/SortButton.vue";

const taskStore = useTaskStore();
const activeView = computed(() => taskStore.activeView);
const isLoading = computed(() => taskStore.loading);
const error = ref(null);

// Use TanStack Query to fetch tasks
const {
  isLoading: queryLoading,
  isError,
  error: queryError,
  refetch,
} = useQuery({
  queryKey: ["tasks"],
  queryFn: fetchTasks,
  onSuccess: (data) => {
    console.log("Query success, received tasks:", data.length);
    // When data is successfully fetched, update the store
    taskStore.tasks = data.map((task) => ({
      ...task,
      id:
        task.id ||
        `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));
  },
  onError: (err) => {
    console.error("Query error:", err);
    error.value = err instanceof Error ? err.message : "Failed to fetch tasks";
  },
  // Don't retry on error
  retry: 1,
  // Enable automatic refetching
  refetchOnWindowFocus: true,
});

const setActiveView = (view) => {
  taskStore.setActiveView(view);
};

// Manual fetch function
const fetchTasksManually = async () => {
  console.log("Manually fetching tasks...");
  error.value = null;

  try {
    await taskStore.fetchTasks();
    console.log("Manually fetched tasks:", taskStore.tasks.length);
  } catch (err) {
    console.error("Manual fetch error:", err);
    error.value = err instanceof Error ? err.message : "Failed to fetch tasks";
  }
};

onMounted(() => {
  // Initial fetch both ways to be sure
  taskStore.fetchTasks();
  setTimeout(() => {
    if (taskStore.tasks.length === 0) {
      console.log("No tasks found after initial fetch, retrying...");
      fetchTasksManually();
    }
  }, 1000);
});

// Watch for errors
watch(queryError, (newError) => {
  if (newError) {
    console.error("Query error detected:", newError);
    error.value =
      newError instanceof Error ? newError.message : "Unknown error";
  }
});
</script>

<style scoped>
.task-layout {
  background-color: #111827;
  color: #fff;
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
}

.header {
  padding: 15px 20px;
  border-bottom: 1px solid #2d3748;
}

.tabs {
  display: flex;
  align-items: center;
}

.tab-btn {
  background: transparent;
  border: none;
  color: #a0aec0;
  font-weight: 500;
  padding: 10px 15px;
  margin-right: 5px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.tab-btn .icon {
  margin-right: 8px;
}

.tab-spacer {
  flex-grow: 1;
}

.controls {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #2d3748;
}

.left-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.content {
  flex: 1;
  overflow: auto;
  padding: 0;
}

.loading-indicator {
  display: flex;
  align-items: center;
  margin-left: auto;
  font-size: 14px;
  color: #a0aec0;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #3182ce;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-banner {
  padding: 10px 20px;
  background-color: rgba(220, 38, 38, 0.1);
  border-bottom: 1px solid rgba(220, 38, 38, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ef4444;
}

.error-icon {
  font-size: 18px;
}

.error-message {
  flex-grow: 1;
}

.retry-button {
  background-color: #374151;
  border: none;
  color: #f3f4f6;
  font-weight: 500;
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.retry-button:hover {
  background-color: #4b5563;
}

.mock-api-notice {
  padding: 10px 20px;
  background-color: rgba(59, 130, 246, 0.1);
  border-bottom: 1px solid rgba(59, 130, 246, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
  color: #3b82f6;
  font-size: 14px;
}

.notice-icon {
  font-size: 18px;
}

.notice-message {
  flex-grow: 1;
}
</style>
