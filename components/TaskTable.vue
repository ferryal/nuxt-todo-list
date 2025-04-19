<template>
  <div class="task-table-wrapper">
    <div
      v-if="isUpdating || isDeleting || taskStore.loading"
      class="loading-overlay"
    >
      <div class="spinner"></div>
      <div class="loading-text">{{ loadingMessage }}</div>
    </div>

    <table class="task-table">
      <thead>
        <tr>
          <th class="checkbox-cell">
            <input
              type="checkbox"
              :checked="allRowsSelected"
              @change="toggleAllRows"
            />
          </th>
          <th v-for="column in columns" :key="column.id">
            {{ column.header }}
          </th>
          <th></th>
          <!-- Actions column -->
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="task in tasks"
          :key="task.id"
          :class="{ 'selected-row': selectedRows.includes(task.id) }"
        >
          <td class="checkbox-cell">
            <input
              type="checkbox"
              :checked="selectedRows.includes(task.id)"
              @change="toggleRow(task.id)"
            />
          </td>

          <!-- Title column -->
          <td class="title-cell">
            <div class="title-content" @click="editTask(task)">
              {{ task.title }}
            </div>
          </td>

          <!-- Developer column -->
          <td>
            <div @click="editTask(task)">
              {{ task.developer }}
            </div>
          </td>

          <!-- Status column -->
          <td>
            <div
              class="status-badge"
              :style="getStatusStyle(task.status)"
              @click="editTask(task)"
            >
              {{ task.status }}
            </div>
          </td>

          <!-- Priority column -->
          <td>
            <div
              class="priority-badge"
              :style="{ color: getPriorityColor(task.priority) }"
              @click="editTask(task)"
            >
              {{ task.priority }}
            </div>
          </td>

          <!-- Type column -->
          <td>
            <div
              class="type-badge"
              :style="{ color: getTypeColor(task.type) }"
              @click="editTask(task)"
            >
              {{ task.type }}
            </div>
          </td>

          <!-- Date column -->
          <td>
            <div @click="editTask(task)">
              {{ formatDate(task.date) }}
            </div>
          </td>

          <!-- Estimated SP column -->
          <td>
            <div @click="editTask(task)">
              {{ task["Estimated SP"] }}
            </div>
          </td>

          <!-- Actual SP column -->
          <td>
            <div @click="editTask(task)">
              {{ task["Actual SP"] }}
            </div>
          </td>

          <!-- Actions column -->
          <td class="actions-cell">
            <button
              @click="editTask(task)"
              class="action-button edit-button"
              title="Edit task"
            >
              <span class="material-icons">edit</span>
            </button>
            <button
              @click="deleteTask(task)"
              class="action-button delete-button"
              title="Delete task"
            >
              <span class="material-icons">delete</span>
            </button>
          </td>
        </tr>
        <tr v-if="tasks.length === 0">
          <td :colspan="columns.length + 2" class="empty-message">
            No tasks found
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="stats-row">
          <td colspan="3"></td>
          <td>
            <div class="stats-container">
              <div
                v-for="(percentage, status) in statusStats"
                :key="status"
                class="stats-bar"
                :style="{
                  width: `${percentage}%`,
                  backgroundColor: getStatusColor(status),
                  order: getStatusOrder(status),
                }"
                :title="`${status}: ${percentage}%`"
              ></div>
            </div>
          </td>
          <td>
            <div class="stats-container">
              <div
                v-for="(percentage, priority) in priorityStats"
                :key="priority"
                class="stats-bar"
                :style="{
                  width: `${percentage}%`,
                  backgroundColor: getPriorityColor(priority),
                  order: getPriorityOrder(priority),
                }"
                :title="`${priority}: ${percentage}%`"
              ></div>
            </div>
          </td>
          <td>
            <div class="stats-container">
              <div
                v-for="(percentage, type) in typeStats"
                :key="type"
                class="stats-bar"
                :style="{
                  width: `${percentage}%`,
                  backgroundColor: getTypeColor(type),
                }"
                :title="`${type}: ${percentage}%`"
              ></div>
            </div>
          </td>
          <td colspan="4"></td>
        </tr>
      </tfoot>
    </table>

    <TaskModal
      v-show="showEditModal"
      v-model:show="showEditModal"
      :task="selectedTask"
      @task-updated="onTaskUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useTaskStore } from "~/stores/taskStore";
import { useMutation } from "@tanstack/vue-query";
import { updateTask, deleteTask as deleteTaskApi } from "~/services/taskApi";
import TaskModal from "~/components/TaskModal.vue";
// No type imports - using JSDoc comments instead

const taskStore = useTaskStore();
const toast = {
  add: (config) => {
    // Simple console fallback for notifications
    const colorEmoji = {
      green: "✅",
      red: "❌",
    };
    console.log(
      `${colorEmoji[config.color] || "ℹ️"} ${config.title}: ${
        config.description
      }`
    );
  },
};

// Define modal state
const showEditModal = ref(false);
const selectedTask = ref(null);

const tasks = computed(() => taskStore.filteredTasks);
const isLoading = ref(false);
const error = ref(null);

// Track specific loading states
const isUpdating = ref(false);
const isDeleting = ref(false);
const isPatching = ref(false);

// Dynamic loading message
const loadingMessage = computed(() => {
  if (isUpdating.value) return "Updating task...";
  if (isDeleting.value) return "Deleting task...";
  if (isPatching.value) return "Saving changes...";
  return "Loading...";
});

// Table definition
const columns = [
  { id: "title", header: "Task" },
  { id: "developer", header: "Developer" },
  { id: "status", header: "Status" },
  { id: "priority", header: "Priority" },
  { id: "type", header: "Type" },
  { id: "date", header: "Date" },
  { id: "estimatedSP", header: "Estimated SP" },
  { id: "actualSP", header: "Actual SP" },
];

// Options for select dropdowns
const statusOptions = [
  "Ready to start",
  "In Progress",
  "Waiting for review",
  "Pending Deploy",
  "Done",
  "Stuck",
];
const priorityOptions = ["Critical", "High", "Medium", "Low", "Best Effort"];
const typeOptions = ["Feature Enhancements", "Other", "Bug"];

// Statistics for the footer
const statusStats = computed(() => taskStore.statusStats);
const priorityStats = computed(() => taskStore.priorityStats);
const typeStats = computed(() => taskStore.typeStats);

// Row selection
const selectedRows = ref([]);
const allRowsSelected = computed(() => {
  return (
    tasks.value.length > 0 && selectedRows.value.length === tasks.value.length
  );
});

const toggleAllRows = () => {
  if (allRowsSelected.value) {
    selectedRows.value = [];
  } else {
    selectedRows.value = tasks.value.map((task) => task.id);
  }
};

const toggleRow = (id) => {
  const index = selectedRows.value.indexOf(id);
  if (index === -1) {
    selectedRows.value.push(id);
  } else {
    selectedRows.value.splice(index, 1);
  }
};

// In-place editing
const editingCell = ref({ id: null, field: null });
const editValue = ref("");
const originalTask = ref(null);

const editTask = (task) => {
  console.log("Opening edit modal for task:", task.id);
  selectedTask.value = { ...task };
  showEditModal.value = true;
  console.log("showEditModal set to:", showEditModal.value);
};

// Remove updateTaskMutation and saveEdit functions since they're now in TaskModal
// Just keep the deleteTaskMutation and related functions

const deleteTaskMutation = useMutation({
  mutationFn: deleteTaskApi,
  onMutate: () => {
    isDeleting.value = true;
  },
  onSuccess: (response, variables) => {
    // Update the Pinia store with the task ID that was deleted
    taskStore.removeTask(variables);

    // Log success for debugging
    console.log("API success: Task deleted successfully", variables);

    toast.add({
      title: "Success",
      description: "Task deleted successfully",
      color: "green",
    });
  },
  onError: (error) => {
    console.error("API error:", error);
    toast.add({
      title: "Error",
      description:
        error instanceof Error ? error.message : "Failed to delete task",
      color: "red",
    });
  },
  onSettled: () => {
    isDeleting.value = false;
  },
});

const deleteTask = (task) => {
  if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
    deleteTaskMutation.mutate(task.id);
  }
};

// Watch for errors and show toast notifications
watch(error, (newError) => {
  if (newError) {
    toast.add({
      title: "Error",
      description: newError,
      color: "red",
    });
  }
});

// Helpers for formatting and styling
const formatDate = (dateStr) => {
  if (!dateStr) {
    // Use the same random date generator
    const randomDate = new Date(generateRandomDate());

    // Format as dd-MM-yyyy
    const day = String(randomDate.getDate()).padStart(2, "0");
    const month = String(randomDate.getMonth() + 1).padStart(2, "0");
    const year = randomDate.getFullYear();

    return `${day}-${month}-${year}`;
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  // Format as dd-MM-yyyy
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

// Status styles with colors
const getStatusColor = (status) => {
  switch (status) {
    case "Ready to start":
      return "#2563eb"; // Blue
    case "In Progress":
      return "#f59e0b"; // Amber
    case "Waiting for review":
      return "#06b6d4"; // Cyan
    case "Pending Deploy":
      return "#8b5cf6"; // Purple
    case "Done":
      return "#10b981"; // Green
    case "Stuck":
      return "#ef4444"; // Red
    default:
      return "#6b7280"; // Gray
  }
};

const getStatusStyle = (status) => {
  return {
    backgroundColor: getStatusColor(status),
    color: status === "In Progress" ? "#1a202c" : "white",
  };
};

const getStatusOrder = (status) => {
  const order = {
    "Ready to start": 1,
    "In Progress": 2,
    "Waiting for review": 3,
    "Pending Deploy": 4,
    Done: 5,
    Stuck: 6,
  };
  return order[status] || 99;
};

// Priority styles
const getPriorityColor = (priority) => {
  switch (priority) {
    case "Critical":
      return "#ef4444"; // Red
    case "High":
      return "#8b5cf6"; // Purple
    case "Medium":
      return "#3b82f6"; // Blue
    case "Low":
      return "#10b981"; // Green
    case "Best Effort":
      return "#6b7280"; // Gray
    default:
      return "#6b7280"; // Gray
  }
};

const getPriorityStyle = (priority) => {
  return {
    backgroundColor: getPriorityColor(priority),
    color: "white",
  };
};

const getPriorityOrder = (priority) => {
  const order = {
    Critical: 1,
    High: 2,
    Medium: 3,
    Low: 4,
    "Best Effort": 5,
  };
  return order[priority] || 99;
};

// Type styles
const getTypeColor = (type) => {
  switch (type) {
    case "Feature Enhancements":
      return "#3b82f6"; // Blue
    case "Bug":
      return "#ef4444"; // Red
    case "Other":
      return "#8b5cf6"; // Purple
    default:
      return "#6b7280"; // Gray
  }
};

const getTypeStyle = (type) => {
  return {
    backgroundColor: getTypeColor(type),
    color: type === "Feature Enhancements" ? "#1a202c" : "white",
  };
};

// Generate a random date
const generateRandomDate = () => {
  // Generate random date from the last 2 years to next 6 months
  const today = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(today.getFullYear() - 2);

  const sixMonthsAhead = new Date();
  sixMonthsAhead.setMonth(today.getMonth() + 6);

  // Random date between twoYearsAgo and sixMonthsAhead
  const randomTimestamp =
    twoYearsAgo.getTime() +
    Math.random() * (sixMonthsAhead.getTime() - twoYearsAgo.getTime());
  const randomDate = new Date(randomTimestamp);

  // Format as ISO string (yyyy-MM-dd)
  const year = randomDate.getFullYear();
  const month = String(randomDate.getMonth() + 1).padStart(2, "0");
  const day = String(randomDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Assign random dates to tasks without dates
watch(
  tasks,
  async (newTasks) => {
    if (!newTasks || newTasks.length === 0) return;

    const tasksNeedingDates = newTasks.filter((task) => !task.date);
    if (tasksNeedingDates.length === 0) return;

    // Set loading state
    isPatching.value = true;

    try {
      // Process tasks sequentially to avoid race conditions
      for (const task of tasksNeedingDates) {
        const randomDate = generateRandomDate();

        // Call API through store's patchTask method which updates the API
        const updatedTask = await taskStore.patchTask(task.id, {
          date: randomDate,
        });

        // Ensure store reflects the latest data from API
        if (updatedTask) {
          console.log(
            `Successfully updated task ${task.id} with random date ${randomDate}`
          );
        }
      }
    } catch (error) {
      console.error(`Failed to update tasks with random dates:`, error);
      toast.add({
        title: "Error",
        description: "Failed to save random dates to tasks",
        color: "red",
      });
    } finally {
      // Clear loading state
      isPatching.value = false;
    }
  },
  { immediate: true }
);

// Add a new function to handle task updates
const onTaskUpdated = (updatedTask) => {
  // Any additional logic after task update can go here
  console.log("Task updated:", updatedTask);
};
</script>

<style scoped>
.task-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.task-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  color: #e2e8f0;
  table-layout: fixed;
}

.task-table th {
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid #2d3748;
  font-weight: 500;
  color: #a0aec0;
}

.task-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #2d3748;
}

.task-table tbody tr:hover {
  background-color: rgba(45, 55, 72, 0.5);
}

.checkbox-cell {
  width: 40px;
}

.empty-message {
  text-align: center;
  padding: 20px;
  color: #a0aec0;
}

.actions-cell {
  width: 80px;
  text-align: right;
}

.action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  margin-left: 8px;
}

/* Editable cells */
.cell {
  min-height: 20px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.status-cell,
.priority-cell,
.type-cell {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.editable-cell {
  padding: 0;
}

.editable-cell input,
.editable-cell select {
  width: 100%;
  padding: 4px 8px;
  background-color: #1a202c;
  border: 1px solid #4a5568;
  border-radius: 4px;
  color: white;
}

/* Stats footer */
.stats-row td {
  padding: 8px 16px;
}

.stats-container {
  height: 8px;
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  background-color: #2d3748;
}

.stats-bar {
  height: 100%;
  transition: width 0.3s;
}

.date-picker {
  cursor: pointer;
  font-family: inherit;
}

.date-picker::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 10px;
  color: #fff;
  font-size: 18px;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.edit-button {
  color: #3b82f6;
}

.delete-button {
  color: #ef4444;
}

.action-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.material-icons {
  font-size: 18px;
  display: inline-block;
  font-family: "Material Icons";
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
}

/* You can use emoji as fallback if Material Icons are not available */
.material-icons:not(:defined) {
  font-family: inherit;
}

.material-icons:not(:defined)[data-icon="edit"]::before {
  content: "✏️";
}

.material-icons:not(:defined)[data-icon="delete"]::before {
  content: "🗑️";
}

/* Make all cells clickable with a hover effect */
td div {
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

td div:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Define badge styles */
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  text-align: center;
}

.priority-badge,
.type-badge {
  font-weight: 500;
}

.selected-row {
  background-color: rgba(59, 130, 246, 0.1);
}
</style>
