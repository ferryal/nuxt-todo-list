# Task Manager - Nuxt Application

A feature-rich task management application built with Nuxt, Vue, Pinia, and TanStack Query. Easily manage, filter, and organize your tasks with a clean and responsive interface.

## Features

- ✅ Create, edit, and delete tasks
- ✅ Filter tasks by developer, status, priority, and type
- ✅ Sort tasks by different criteria
- ✅ Responsive design for all devices
- ✅ Visual statistics for task distribution
- ✅ Offline support with in-memory cache

## Important API Note

**IMPORTANT:** The task API currently only supports GET requests for fetching data, despite having endpoints for other operations. For demonstration purposes, the app simulates write operations locally:

- When creating/updating/deleting tasks, changes are applied to the in-memory store
- The API client in `services/taskApi.ts` handles these operations by modifying the local cache
- All changes will be lost upon page refresh

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev
```

## Using the Application

1. **View Tasks**: All tasks are displayed in a table format on the main page
2. **Create a Task**: Click the "New Task" button to open the creation modal
3. **Edit a Task**: Click on any cell in a task row or the edit button to modify a task
4. **Delete a Task**: Click the delete button on a task row
5. **Filter Tasks**: Use the filter controls in the header to narrow down task list
6. **Sort Tasks**: Click the sort button to arrange tasks by different criteria

## Implementation Details

The application uses:

- **Nuxt 3**: For server-side rendering and project structure
- **Vue 3**: With Composition API for reactive components
- **Pinia**: For state management of tasks and filters
- **TanStack Query**: For API request handling and caching
- **In-memory Cache**: To simulate CRUD operations without actual API support

## Project Structure

- `components/`: All Vue components
  - `TaskModal.vue`: Reusable modal for creating and editing tasks
  - `TaskTable.vue`: Main table display for tasks
  - `NewTaskButton.vue`: Button to create new tasks
  - Other filtering and layout components
- `services/`: API and external service integrations
  - `taskApi.ts`: Task API service with in-memory cache
- `stores/`: Pinia stores
  - `taskStore.ts`: Central state for tasks, filters, and statistics

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build
```

## Preview Production Build

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
