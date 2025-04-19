<template>
  <div class="person-filter">
    <button @click="toggleDropdown" class="person-btn">
      <span class="icon">👤</span>
      Person
    </button>

    <div v-if="showDropdown" class="dropdown">
      <div class="dropdown-search">
        <input
          v-model="searchText"
          placeholder="Search developer"
          class="search-input"
          @input="filterDevelopers"
        />
      </div>

      <div class="dropdown-list">
        <div
          class="dropdown-item"
          :class="{ selected: !selectedDeveloper }"
          @click="selectDeveloper('')"
        >
          All developers
        </div>

        <div
          v-for="dev in filteredDevelopers"
          :key="dev"
          class="dropdown-item"
          :class="{ selected: selectedDeveloper === dev }"
          @click="selectDeveloper(dev)"
        >
          {{ dev }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useTaskStore } from "~/stores/taskStore";

const taskStore = useTaskStore();
const searchText = ref("");
const selectedDeveloper = ref("");
const showDropdown = ref(false);

// Ensure we get the developers from the store
const developers = computed(() => {
  if (!taskStore.uniqueDevelopers) {
    console.warn("uniqueDevelopers is undefined in the store");
    return [];
  }
  return taskStore.uniqueDevelopers;
});

const filteredDevelopers = computed(() => {
  if (!searchText.value) return developers.value;

  return developers.value.filter((dev) =>
    dev.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const selectDeveloper = (developer) => {
  selectedDeveloper.value = developer;

  const statusFilters = [...taskStore.filters.status];
  const priorityFilters = [...taskStore.filters.priority];
  const dateFilter = taskStore.filters.date;

  // If no developer is selected, just preserve other filters
  if (!developer) {
    taskStore.filters = {
      status: statusFilters,
      priority: priorityFilters,
      date: dateFilter,
      developer: null,
    };
  } else {
    // Otherwise add the developer filter
    taskStore.filters = {
      status: statusFilters,
      priority: priorityFilters,
      date: dateFilter,
      developer,
    };
  }

  showDropdown.value = false;
};

const filterDevelopers = () => {
  // This is just to trigger the computed property
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest(".person-filter")) {
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
.person-filter {
  position: relative;
}

.person-btn {
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
}

.dropdown-search {
  padding: 10px;
  border-bottom: 1px solid #2d3748;
}

.search-input {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #4a5568;
  background-color: #2d3748;
  color: white;
}

.dropdown-list {
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #2d3748;
}

.dropdown-item.selected {
  background-color: #2c5282;
}
</style>
