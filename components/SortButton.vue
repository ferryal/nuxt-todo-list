<template>
  <div class="sort-filter">
    <button @click="toggleDropdown" class="sort-btn">
      <span class="icon">⇅</span>
      Sort
    </button>

    <div v-if="showDropdown" class="dropdown">
      <div class="dropdown-header">Sort by</div>

      <div class="dropdown-options">
        <div
          v-for="sortOption in sortOptions"
          :key="sortOption.field"
          class="sort-option"
          @click="selectSortOption(sortOption)"
        >
          <div class="sort-label">{{ sortOption.label }}</div>
          <div class="sort-arrows">
            <span
              class="sort-arrow"
              :class="{
                active:
                  activeSort.field === sortOption.field &&
                  activeSort.direction === 'asc',
              }"
              @click.stop="setDirection(sortOption, 'asc')"
            >
              ▲
            </span>
            <span
              class="sort-arrow"
              :class="{
                active:
                  activeSort.field === sortOption.field &&
                  activeSort.direction === 'desc',
              }"
              @click.stop="setDirection(sortOption, 'desc')"
            >
              ▼
            </span>
          </div>
        </div>
      </div>

      <div class="dropdown-footer">
        <button class="clear-button" @click="clearSort">Clear sort</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useTaskStore } from "~/stores/taskStore";

const taskStore = useTaskStore();
const showDropdown = ref(false);

const sortOptions = [
  { field: "dueDate", label: "Date" },
  { field: "priority", label: "Priority" },
  { field: "title", label: "Task" },
  { field: "developer", label: "Developer" },
  { field: "status", label: "Status" },
  { field: "type", label: "Type" },
  { field: "Estimated SP", label: "Estimated SP" },
  { field: "Actual SP", label: "Actual SP" },
];

// Initialize with current store sort settings if available
const storeSort = computed(() => {
  return {
    field: taskStore.sort || "",
    direction: taskStore.sortDirection || "asc",
  };
});

const activeSort = ref({
  field: "",
  direction: "asc",
});

// Set the initial sort from the store on mount
onMounted(() => {
  if (storeSort.value.field) {
    activeSort.value.field = storeSort.value.field;
    activeSort.value.direction = storeSort.value.direction;
  }
});

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const selectSortOption = (option) => {
  // Toggle the direction if the same field is selected
  if (activeSort.value.field === option.field) {
    activeSort.value.direction =
      activeSort.value.direction === "asc" ? "desc" : "asc";
  } else {
    activeSort.value.field = option.field;
    activeSort.value.direction = "asc";
  }

  // Apply sorting to tasks using appropriate store method
  applySorting(option);
};

const setDirection = (option, direction) => {
  activeSort.value.field = option.field;
  activeSort.value.direction = direction;

  // Apply sorting to tasks
  applySorting(option);
};

const applySorting = (option) => {
  // Get the field to use for sorting
  const sortField = option.field;

  // We have verified that the taskStore has setSortOption method
  taskStore.setSortOption(sortField, activeSort.value.direction);

  // Close dropdown after selecting an option
  showDropdown.value = false;
};

const clearSort = () => {
  activeSort.value = { field: "", direction: "asc" };
  taskStore.clearSort();
  showDropdown.value = false;
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest(".sort-filter")) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.sort-filter {
  position: relative;
}

.sort-btn {
  background-color: #2d3748;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.icon {
  margin-right: 5px;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 250px;
  background-color: #1a202c;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  margin-top: 5px;
  z-index: 10;
  padding: 10px;
}

.dropdown-header {
  font-size: 14px;
  font-weight: 500;
  color: #a0aec0;
  margin-bottom: 8px;
  padding: 0 5px;
}

.dropdown-options {
  max-height: 300px;
  overflow-y: auto;
}

.sort-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.sort-option:hover {
  background-color: #2d3748;
}

.sort-arrows {
  display: flex;
  gap: 8px;
}

.sort-arrow {
  cursor: pointer;
  color: #718096;
  font-size: 12px;
}

.sort-arrow.active {
  color: #4299e1;
}

.dropdown-footer {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #2d3748;
  display: flex;
  justify-content: flex-end;
}

.clear-button {
  background: none;
  border: none;
  color: #a0aec0;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
}

.clear-button:hover {
  color: #e2e8f0;
}
</style>
