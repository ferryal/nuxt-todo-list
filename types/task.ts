export type TaskStatus =
  | "Ready to start"
  | "In Progress"
  | "Waiting for review"
  | "Pending Deploy"
  | "Done"
  | "Stuck";
export type TaskPriority =
  | "Critical"
  | "High"
  | "Medium"
  | "Low"
  | "Best Effort";
export type TaskType = "Feature Enhancements" | "Other" | "Bug";

export interface Task {
  title: string;
  developer: string;
  priority: TaskPriority;
  status: TaskStatus;
  type: TaskType;
  date?: string;
  "Estimated SP": number;
  "Actual SP": number;
  id?: string; // Adding ID for easier tracking
}

export interface ApiResponse {
  response: boolean;
  data: Task[];
}
