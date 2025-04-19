import { defineStore } from "pinia";
import type { Task, TaskStatus, TaskPriority, TaskType } from "~/types/task";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  patchTask,
} from "~/services/taskApi";

export type ActiveView = "all" | "today" | "upcoming" | "completed";
export type SortOption = "dueDate" | "priority" | "createdAt";

export const useTaskStore = defineStore("tasks", {
  state: () => ({
    tasks: [] as Task[],
    loading: false,
    error: null as string | null,
    selectedTasks: [] as string[],
    filters: {
      status: [] as TaskStatus[],
      priority: [] as TaskPriority[],
      date: null as Date | null,
      developer: null as string | null,
    },
    searchQuery: "",
    activeView: "all" as ActiveView,
    sort: "dueDate" as SortOption,
    sortDirection: "asc" as "asc" | "desc",
    dataFetched: false,
  }),

  getters: {
    // Filter tasks based on current filters and search query
    filteredTasks(): Task[] {
      let filtered = [...this.tasks];

      // Filter by status if filters are set
      if (this.filters.status.length > 0) {
        filtered = filtered.filter((task) =>
          this.filters.status.includes(task.status)
        );
      }

      // Filter by priority if filters are set
      if (this.filters.priority.length > 0) {
        filtered = filtered.filter((task) =>
          this.filters.priority.includes(task.priority)
        );
      }

      // Filter by developer if set
      if (this.filters.developer) {
        filtered = filtered.filter((task) => {
          if (!task.developer) return false;
          // Handle comma-separated developers
          if (task.developer.includes(",")) {
            const devs = task.developer.split(",").map((d) => d.trim());
            return devs.includes(this.filters.developer as string);
          }
          return task.developer.trim() === this.filters.developer;
        });
      }

      // Filter by date if set
      if (this.filters.date) {
        const filterDate = new Date(this.filters.date);
        filtered = filtered.filter((task) => {
          if (!task.date) return false;
          const taskDate = new Date(task.date);
          return (
            taskDate.getFullYear() === filterDate.getFullYear() &&
            taskDate.getMonth() === filterDate.getMonth() &&
            taskDate.getDate() === filterDate.getDate()
          );
        });
      }

      // Filter by active view
      if (this.activeView === "today") {
        // Only show tasks due today
        const today = new Date();
        filtered = filtered.filter((task) => {
          if (!task.date) return false;
          const taskDate = new Date(task.date);
          return (
            taskDate.getFullYear() === today.getFullYear() &&
            taskDate.getMonth() === today.getMonth() &&
            taskDate.getDate() === today.getDate()
          );
        });
      } else if (this.activeView === "upcoming") {
        // Show tasks due in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = filtered.filter((task) => {
          if (!task.date) return false;
          const taskDate = new Date(task.date);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate > today;
        });
      } else if (this.activeView === "completed") {
        // Only show completed tasks
        filtered = filtered.filter((task) => task.status === "Done");
      }

      // Filter by search query
      if (this.searchQuery.trim() !== "") {
        const query = this.searchQuery.toLowerCase().trim();
        filtered = filtered.filter((task) =>
          task.title.toLowerCase().includes(query)
        );
      }

      // Sort tasks based on sort option
      if (this.sort === "dueDate") {
        filtered.sort((a, b) => {
          if (!a.date) return this.sortDirection === "asc" ? 1 : -1;
          if (!b.date) return this.sortDirection === "asc" ? -1 : 1;
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return this.sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        });
      } else if (this.sort === "priority") {
        const priorityOrder = {
          Critical: 5,
          High: 4,
          Medium: 3,
          Low: 2,
          "Best Effort": 1,
        };
        filtered.sort((a, b) => {
          const priorityA =
            priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          const priorityB =
            priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          return this.sortDirection === "asc"
            ? priorityA - priorityB
            : priorityB - priorityA;
        });
      } else if (this.sort === "createdAt") {
        // If there is no createdAt, use date field if available
        filtered.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return this.sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        });
      }

      return filtered;
    },

    // Get all unique developers from tasks
    uniqueDevelopers(): string[] {
      const developers = new Set<string>();

      this.tasks.forEach((task) => {
        if (task.developer) {
          // Handle comma-separated developers
          if (task.developer.includes(",")) {
            const devs = task.developer.split(",").map((d) => d.trim());
            devs.forEach((dev) => {
              if (dev) developers.add(dev);
            });
          } else {
            developers.add(task.developer.trim());
          }
        }
      });

      // Convert Set to Array and sort alphabetically
      return Array.from(developers).sort();
    },

    // Get task counts by status
    taskCountsByStatus(): { [key in TaskStatus]: number } {
      const counts = {
        "Ready to start": 0,
        "In Progress": 0,
        "Waiting for review": 0,
        "Pending Deploy": 0,
        Done: 0,
        Stuck: 0,
      };

      this.tasks.forEach((task) => {
        counts[task.status]++;
      });

      return counts;
    },

    // Get filtered tasks grouped by status
    tasksByStatus(): { [key in TaskStatus]: Task[] } {
      const grouped = {
        "Ready to start": [] as Task[],
        "In Progress": [] as Task[],
        "Waiting for review": [] as Task[],
        "Pending Deploy": [] as Task[],
        Done: [] as Task[],
        Stuck: [] as Task[],
      };

      this.filteredTasks.forEach((task) => {
        grouped[task.status].push(task);
      });

      return grouped;
    },

    // Get task by ID
    getTaskById: (state) => (id: string) => {
      return state.tasks.find((task) => task.id === id);
    },
  },

  actions: {
    // Fetch tasks from API (only call this once during app initialization)
    async fetchTasks() {
      if (this.dataFetched) {
        return; // Don't fetch data again if already fetched
      }

      this.loading = true;
      this.error = null;

      try {
        const tasks = await fetchTasks();
        this.tasks = tasks;
        this.dataFetched = true;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Failed to fetch tasks";
        console.error("Error in task store:", this.error);
      } finally {
        this.loading = false;
      }
    },

    // Add a new task
    async addTask(task: Omit<Task, "id">) {
      this.loading = true;
      this.error = null;

      try {
        // Client-side task creation with the API service
        const newTask = await createTask(task as Task);

        // Ensure the new task is at the beginning of the tasks array
        this.tasks = [newTask, ...this.tasks];
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Failed to add task";
        console.error("Error adding task:", this.error);
      } finally {
        this.loading = false;
      }
    },

    // Update a task
    async updateTask(task: Task) {
      this.loading = true;
      this.error = null;

      try {
        // Client-side task update with the API service
        const updatedTask = await updateTask(task);

        // Update the task in the store with the response from the API
        const index = this.tasks.findIndex((t) => t.id === task.id);
        if (index !== -1) {
          // Use the API response instead of the input task to ensure consistency
          this.tasks[index] = { ...updatedTask };
        }

        // Return the updated task from the API
        return updatedTask;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Failed to update task";
        console.error("Error updating task:", this.error);
        throw error; // Re-throw the error for proper error handling in components
      } finally {
        this.loading = false;
      }
    },

    // Remove a task
    async removeTask(taskId: string) {
      this.loading = true;
      this.error = null;

      try {
        // Client-side task deletion with the API service
        const response = await deleteTask(taskId);

        // Remove the task from the store
        this.tasks = this.tasks.filter((task) => task.id !== taskId);

        // Also remove from selected tasks if present
        this.selectedTasks = this.selectedTasks.filter((id) => id !== taskId);

        // Return the API response
        return response;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Failed to remove task";
        console.error("Error removing task:", this.error);
        throw error; // Re-throw the error for proper error handling in components
      } finally {
        this.loading = false;
      }
    },

    // Patch a task (partial update)
    async patchTask(taskId: string, updates: Partial<Task>) {
      this.loading = true;
      this.error = null;

      try {
        // Client-side task patching with the API service
        const updatedTask = await patchTask(taskId, updates);

        // Update the task in the store
        const index = this.tasks.findIndex((task) => task.id === taskId);
        if (index !== -1) {
          this.tasks[index] = { ...updatedTask };
        }

        // Return the updated task so components can use it
        return updatedTask;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Failed to patch task";
        console.error("Error patching task:", this.error);
        throw error; // Re-throw the error for proper error handling in components
      } finally {
        this.loading = false;
      }
    },

    // Set filter for developer
    setFilterDeveloper(developer: string) {
      if (developer) {
        // Update filters with the selected developer
        this.filters = {
          ...this.filters,
          developer,
        };
      } else {
        // If no developer selected, create a new filters object without the developer property
        this.filters = {
          status: [...this.filters.status],
          priority: [...this.filters.priority],
          date: this.filters.date,
          developer: null,
        };
      }
    },

    // Set filters
    setFilters(filters: Partial<typeof this.filters>) {
      this.filters = { ...this.filters, ...filters };
    },

    // Clear all filters
    clearFilters() {
      this.filters = {
        status: [],
        priority: [],
        date: null,
        developer: null,
      };
    },

    // Set search query
    setSearchQuery(query: string) {
      this.searchQuery = query;
    },

    // Set active view
    setActiveView(view: ActiveView) {
      this.activeView = view;
    },

    // Set sort option
    setSort(sort: SortOption, direction: "asc" | "desc" = "asc") {
      this.sort = sort;
      this.sortDirection = direction;
    },

    // Set sort option with any field (for SortButton component)
    setSortOption(field: string, direction: "asc" | "desc" = "asc") {
      // Map the field to a valid SortOption if possible
      if (field === "date" || field === "dueDate") {
        this.sort = "dueDate";
      } else if (field === "priority") {
        this.sort = "priority";
      } else {
        // Default to dueDate for unknown fields
        this.sort = "dueDate";
      }

      this.sortDirection = direction;
    },

    // Clear sort settings
    clearSort() {
      this.sort = "dueDate";
      this.sortDirection = "asc";
    },

    // Toggle task selection
    toggleTaskSelection(taskId: string) {
      const index = this.selectedTasks.indexOf(taskId);
      if (index === -1) {
        this.selectedTasks.push(taskId);
      } else {
        this.selectedTasks.splice(index, 1);
      }
    },

    // Clear task selection
    clearTaskSelection() {
      this.selectedTasks = [];
    },
  },
});
