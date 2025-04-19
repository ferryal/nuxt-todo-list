<template>
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" ref="modalRef">
      <div class="modal-header">
        <h3 class="modal-title">
          {{ isEditing ? "Edit Task" : "Create New Task" }}
        </h3>
        <button @click="closeModal" class="close-button">×</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label for="title">Task</label>
          <input
            type="text"
            id="title"
            v-model="form.title"
            required
            class="form-input"
            autofocus
          />
        </div>

        <div class="form-group">
          <label for="developer">Developer</label>
          <input
            type="text"
            id="developer"
            v-model="form.developer"
            required
            placeholder="Use comma to separate multiple developers"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="status">Status</label>
          <select
            id="status"
            v-model="form.status"
            required
            class="form-select"
          >
            <option>Ready to start</option>
            <option>In Progress</option>
            <option>Waiting for review</option>
            <option>Pending Deploy</option>
            <option>Done</option>
            <option>Stuck</option>
          </select>
        </div>

        <div class="form-group">
          <label for="priority">Priority</label>
          <select
            id="priority"
            v-model="form.priority"
            required
            class="form-select"
          >
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
            <option>Best Effort</option>
          </select>
        </div>

        <div class="form-group">
          <label for="type">Type</label>
          <select id="type" v-model="form.type" required class="form-select">
            <option>Feature Enhancements</option>
            <option>Other</option>
            <option>Bug</option>
          </select>
        </div>

        <div class="form-group">
          <label for="date">Date</label>
          <input
            type="date"
            id="date"
            v-model="form.date"
            class="form-input date-picker"
          />
        </div>

        <div class="form-row">
          <div class="form-group half-width">
            <label for="estimatedSP">Estimated SP</label>
            <input
              type="number"
              id="estimatedSP"
              v-model.number="form.estimatedSP"
              min="0"
              class="form-input"
            />
          </div>

          <div class="form-group half-width">
            <label for="actualSP">Actual SP</label>
            <input
              type="number"
              id="actualSP"
              v-model.number="form.actualSP"
              min="0"
              class="form-input"
            />
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button
          @click="closeModal"
          class="cancel-button"
          :disabled="isSubmitting"
        >
          Cancel
        </button>
        <button
          @click="submitForm"
          class="submit-button"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="loading-spinner"></span>
          <span v-else>{{ isEditing ? "Update Task" : "Create Task" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useTaskStore } from "~/stores/taskStore";
import { useMutation } from "@tanstack/vue-query";
import { useToast } from "#ui/composables/useToast";
import { createTask, updateTask } from "~/services/taskApi";

const props = defineProps({
  task: {
    type: Object,
    default: null,
  },
  show: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:show", "taskCreated", "taskUpdated"]);

const taskStore = useTaskStore();
const toast = useToast();
const isSubmitting = ref(false);
const modalRef = ref(null);

const isEditing = computed(() => !!props.task);

const defaultForm = {
  title: "",
  developer: "",
  status: "Ready to start",
  priority: "Medium",
  type: "Feature Enhancements",
  date: "",
  estimatedSP: 0,
  actualSP: 0,
};

const form = ref({ ...defaultForm });

// Define resetForm before it's used in watch
const resetForm = () => {
  form.value = { ...defaultForm };
};

const closeModal = () => {
  emit("update:show", false);
  resetForm();
};

// Watch for the task prop to update the form
watch(
  () => props.task,
  (newTask) => {
    if (newTask) {
      form.value = {
        title: newTask.title || "",
        developer: newTask.developer || "",
        status: newTask.status || "Ready to start",
        priority: newTask.priority || "Medium",
        type: newTask.type || "Feature Enhancements",
        date: newTask.date || "",
        estimatedSP: newTask["Estimated SP"] || 0,
        actualSP: newTask["Actual SP"] || 0,
      };
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

// Watch for the show prop to handle body overflow
watch(
  () => props.show,
  (newShow) => {
    console.log("TaskModal show prop changed:", newShow);
    // Only manipulate the DOM on the client side
    if (process.client) {
      if (newShow) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
  },
  { immediate: true }
);

const createTaskMutation = useMutation({
  mutationFn: createTask,
  onSuccess: (newTask) => {
    taskStore.addTask(newTask);
    toast.add({
      title: "Success",
      description: "Task created successfully",
      color: "green",
    });
    isSubmitting.value = false;
    emit("taskCreated", newTask);
    closeModal();
  },
  onError: (error) => {
    toast.add({
      title: "Error",
      description:
        error instanceof Error ? error.message : "Failed to create task",
      color: "red",
    });
    isSubmitting.value = false;
  },
});

const updateTaskMutation = useMutation({
  mutationFn: updateTask,
  onSuccess: (updatedTask) => {
    taskStore.updateTask(updatedTask);
    toast.add({
      title: "Success",
      description: "Task updated successfully",
      color: "green",
    });
    isSubmitting.value = false;
    emit("taskUpdated", updatedTask);
    closeModal();
  },
  onError: (error) => {
    toast.add({
      title: "Error",
      description:
        error instanceof Error ? error.message : "Failed to update task",
      color: "red",
    });
    isSubmitting.value = false;
  },
});

const submitForm = () => {
  isSubmitting.value = true;

  const taskData = {
    title: form.value.title,
    developer: form.value.developer,
    status: form.value.status,
    priority: form.value.priority,
    type: form.value.type,
    date: form.value.date,
    "Estimated SP": form.value.estimatedSP,
    "Actual SP": form.value.actualSP,
  };

  if (isEditing.value) {
    updateTaskMutation.mutate({ ...taskData, id: props.task.id });
  } else {
    createTaskMutation.mutate(taskData);
  }
};

const handleOverlayClick = (event) => {
  if (event.target === event.currentTarget) {
    closeModal();
  }
};

// Add keyboard event handler for Escape key
const handleKeyDown = (event) => {
  if (event.key === "Escape" && props.show) {
    closeModal();
  }
};

// Add and remove event listeners - only on client side
onMounted(() => {
  console.log("TaskModal mounted, show:", props.show);
  if (process.client) {
    document.addEventListener("keydown", handleKeyDown);
  }
});

onUnmounted(() => {
  if (process.client) {
    document.removeEventListener("keydown", handleKeyDown);
    // Ensure scrolling is restored if component is unmounted while modal is open
    document.body.style.overflow = "";
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.modal-container {
  background-color: #1e293b;
  border-radius: 8px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  width: 95%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 10000;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #334155;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #f8fafc;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.half-width {
  width: 50%;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #cbd5e1;
}

.form-input,
.form-select {
  width: 100%;
  padding: 8px 12px;
  background-color: #1e293b;
  border: 1px solid #334155;
  border-radius: 4px;
  color: #f8fafc;
  font-size: 14px;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #334155;
}

.cancel-button {
  padding: 8px 16px;
  background-color: transparent;
  border: 1px solid #475569;
  color: #e2e8f0;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.submit-button {
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.submit-button:hover {
  background-color: #2563eb;
}

.submit-button:disabled,
.cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.date-picker {
  cursor: pointer;
}
</style>
