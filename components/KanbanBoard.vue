<template>
  <div class="kanban-board">
    <div class="kanban-columns">
      <div
        v-for="(tasks, status) in tasksByStatus"
        :key="status"
        class="kanban-column"
        @dragover.prevent
        @drop="handleDrop($event, status)"
      >
        <div
          class="column-header"
          :style="{ backgroundColor: getStatusColor(status) }"
        >
          <h3>{{ status }}</h3>
          <span class="task-count">{{ tasks.length }}</span>
        </div>

        <div class="column-content">
          <div v-if="tasks.length === 0" class="empty-column">No tasks</div>

          <div
            v-for="task in tasks"
            :key="task.id"
            class="task-card"
            draggable="true"
            @dragstart="handleDragStart($event, task)"
            @dragend="handleDragEnd"
          >
            <div class="task-header">
              <span class="task-title">{{ task.title }}</span>
            </div>
            <div class="task-meta">
              <div
                class="task-tag priority"
                :style="getPriorityStyle(task.priority)"
              >
                {{ task.priority }}
              </div>
              <div class="task-tag type" :style="getTypeStyle(task.type)">
                {{ task.type }}
              </div>
            </div>
            <div class="task-details">
              <div class="task-sp">
                <span class="sp-label">SP:</span> {{ task["Estimated SP"] }}
              </div>
              <div class="task-developer">
                {{ formatDeveloper(task.developer) }}
              </div>
            </div>
            <div class="task-actions">
              <button class="action-btn edit" @click="editTask(task)">
                ✏️
              </button>
              <button class="action-btn delete" @click="deleteTask(task)">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useTaskStore } from "~/stores/taskStore";
import { useMutation } from "@tanstack/vue-query";
import { updateTask, deleteTask as deleteTaskApi } from "~/services/taskApi";
// No type imports - using JSDoc comments instead

const taskStore = useTaskStore();
const tasksByStatus = computed(() => taskStore.tasksByStatus);
const isLoading = computed(() => taskStore.loading);
const error = computed(() => taskStore.error);

// Toast implementation
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

// Drag and drop state
const draggedTask = ref(null);

const handleDragStart = (event, task) => {
  draggedTask.value = task;
  event.dataTransfer.effectAllowed = "move";
};

const handleDragEnd = () => {
  draggedTask.value = null;
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

const updateTaskMutation = useMutation({
  mutationFn: updateTask,
  onSuccess: (updatedTask) => {
    taskStore.updateTask(updatedTask);
    toast.add({
      title: "Success",
      description: "Task status updated",
      color: "green",
    });
  },
  onError: (error) => {
    toast.add({
      title: "Error",
      description:
        error instanceof Error ? error.message : "Failed to update task status",
      color: "red",
    });
  },
});

const handleDrop = (event, newStatus) => {
  event.preventDefault();

  if (!draggedTask.value) return;

  if (draggedTask.value.status !== newStatus) {
    const updatedTask = { ...draggedTask.value, status: newStatus };
    updateTaskMutation.mutate(updatedTask);
  }
};

const editTask = (task) => {
  taskStore.setSelectedTask(task);
  // This would typically open a modal or form for editing
};

const deleteTaskMutation = useMutation({
  mutationFn: deleteTaskApi,
  onSuccess: (_, variables) => {
    taskStore.removeTask(variables);
    toast.add({
      title: "Success",
      description: "Task deleted successfully",
      color: "green",
    });
  },
  onError: (error) => {
    toast.add({
      title: "Error",
      description:
        error instanceof Error ? error.message : "Failed to delete task",
      color: "red",
    });
  },
});

const deleteTask = (task) => {
  if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
    deleteTaskMutation.mutate(task.id);
  }
};

// Helper functions for formatting and styling
const formatDeveloper = (developer) => {
  if (!developer) return "";
  if (developer.includes(",")) {
    const developers = developer.split(",").map((d) => d.trim());
    if (developers.length > 1) {
      return developers[0] + ` +${developers.length - 1}`;
    }
    return developers[0];
  }
  return developer;
};

// Status colors
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
      return "#6b7280";
  }
};

const getPriorityStyle = (priority) => {
  return {
    backgroundColor: getPriorityColor(priority),
    color: "white",
  };
};

// Type styles
const getTypeColor = (type) => {
  switch (type) {
    case "Feature Enhancements":
      return "#f59e0b"; // Amber
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
</script>

<style scoped>
.kanban-board {
  height: calc(100vh - 140px);
  overflow-x: auto;
  padding: 20px;
}

.kanban-columns {
  display: flex;
  gap: 20px;
  height: 100%;
  min-width: fit-content;
}

.kanban-column {
  flex: 1;
  min-width: 280px;
  background-color: #1a202c;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.column-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.column-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.task-count {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 14px;
}

.column-content {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-column {
  padding: 16px;
  text-align: center;
  color: #718096;
  font-style: italic;
  border: 2px dashed #2d3748;
  border-radius: 6px;
  margin-top: 8px;
}

.task-card {
  background-color: #2d3748;
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: grab;
  position: relative;
}

.task-card:hover {
  background-color: #374151;
}

.task-card:active {
  cursor: grabbing;
}

.task-header {
  margin-bottom: 8px;
}

.task-title {
  font-weight: 500;
  font-size: 14px;
  color: white;
}

.task-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.task-tag {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.task-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #a0aec0;
}

.task-sp {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sp-label {
  color: #718096;
}

.task-developer {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 150px;
}

.task-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: none;
}

.task-card:hover .task-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 2px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.action-btn:hover {
  opacity: 1;
}
</style>
