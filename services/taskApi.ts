import type { Task, ApiResponse } from "~/types/task";

const API_URL = "https://mocki.io/v1/9d9895f9-70eb-49d2-99f7-cb3dacca8a94";

// In-memory cache for tasks
let taskCache: Task[] = [];

// This API only supports GET requests - we'll only call this once
export const fetchTasks = async (): Promise<Task[]> => {
  try {
    console.log("Fetching tasks from API:", API_URL);

    // If we already have tasks in the cache, return them
    if (taskCache.length > 0) {
      console.log("Returning tasks from cache, count:", taskCache.length);
      return [...taskCache];
    }

    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      // Prevent caching issues
      cache: "no-cache",
    });

    if (!response.ok) {
      console.error(
        "API response error:",
        response.status,
        response.statusText
      );
      throw new Error(
        `Failed to fetch tasks: ${response.status} ${response.statusText}`
      );
    }

    const data: ApiResponse = await response.json();
    console.log("API response received, tasks count:", data.data?.length || 0);

    if (!data || !data.data) {
      console.error("Invalid API response format:", data);
      throw new Error("Invalid API response format");
    }

    // Add IDs to tasks that don't have them
    const tasks = data.data.map((task) => ({
      ...task,
      id:
        task.id ||
        `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));

    // Store tasks in the cache
    taskCache = [...tasks];
    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

// Client-side implementation for creating a task
export const createTask = async (task: Task): Promise<Task> => {
  try {
    // Generate a unique ID if one is not provided
    const newTask = {
      ...task,
      id:
        task.id ||
        `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    // Add to the in-memory cache
    taskCache.unshift(newTask);

    return newTask;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

// Client-side implementation for updating a task
export const updateTask = async (task: Task): Promise<Task> => {
  try {
    if (!task.id) {
      throw new Error("Task ID is required for update");
    }

    const index = taskCache.findIndex((t) => t.id === task.id);
    if (index === -1) {
      throw new Error(`Task with ID ${task.id} not found`);
    }

    // Update the task in the cache
    taskCache[index] = { ...task };

    return task;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

// Client-side implementation for deleting a task
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const index = taskCache.findIndex((t) => t.id === taskId);
    if (index === -1) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    // Remove the task from the cache
    taskCache = taskCache.filter((t) => t.id !== taskId);
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

// Client-side implementation for partially updating a task
export const patchTask = async (
  taskId: string,
  updates: Partial<Task>
): Promise<Task> => {
  try {
    if (!taskId) {
      throw new Error("Task ID is required for patching");
    }

    const index = taskCache.findIndex((t) => t.id === taskId);
    if (index === -1) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    // Update the task in the cache
    taskCache[index] = { ...taskCache[index], ...updates };

    return taskCache[index];
  } catch (error) {
    console.error("Error patching task:", error);
    throw error;
  }
};
