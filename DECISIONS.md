# Architectural Decisions

## 2026-11-01 - Replace "Success" with "Winner" and create `DECISIONS.md`

### Implemented:
The `Home.jsx` component's displayed text "Success" was changed to "Winner" as requested.
This `DECISIONS.md` file was created to document architectural rules and implementations.

### Adapter File Strategy:
The current task does not involve data/API calls, so an adapter file (e.g., `src/services/api.ts` or `src/lib/backend.ts`) was not required or created for this specific change.

However, for future data/API interactions, the strategy is as follows:
All data fetching and API calls will be centralized in a dedicated adapter file. This file will abstract the underlying data source (e.g., Base44 SDK, a custom VPS backend). UI components will interact only with this adapter, never directly with Base44 SDK or other platform-specific APIs. This ensures decoupling, making it easy to swap out the backend implementation by modifying only the adapter file, without altering UI components.

### Running on a Private Server:
To run this project on a private server, you would typically:
1.  **Build the application:** Run `npm run build` (or `yarn build`) to create a production-ready build of the React application. This generates static files, usually in a `dist` or `build` directory.
2.  **Serve the static files:** Configure a web server (e.g., Nginx, Apache, Caddy, or a Node.js server like Express) to serve the static files from the build directory. Ensure that all routes are handled by serving the `index.html` file (single-page application routing).
3.  **Backend (if applicable):** If the application eventually uses a custom backend (not Base44), that backend API would need to be deployed separately and configured to communicate with the frontend. Environment variables for API endpoints would be updated accordingly in the frontend build process.

### Validation:
The change was a simple text replacement in a JSX file and the creation of a Markdown file. No compilation or TypeScript errors are expected from this specific change.

## 2026-11-01 - Setup SuccessGoal Schema and Decoupled API Adapter

### Implemented:
1.  **`base44/entities/SuccessGoal.json`**: Defined the schema for the `SuccessGoal` entity with properties: `id`, `title`, `category`, `target_value`, `current_value`, `unit`, `progress_pct`, `milestones`, `proof_notes`, and `status`.
2.  **`src/services/api.ts`**: Implemented a decoupled API adapter.
    *   It exports an `api` object with methods `getGoals()`, `createGoal(data)`, `updateGoal(id, data)`, and `deleteGoal(id)`.
    *   The adapter checks for the presence of `window.base44`.
    *   If `window.base44` exists, it utilizes `base44.entities.SuccessGoal` for data operations.
    *   If `window.base44` is not present (e.g., during local development or when running on a custom backend), it falls back to `localStorage` for data persistence.
    *   The `localStorage` fallback is seeded with demo goals: "₹10L Passive Income", "Private Jet", and "2h Screen Time".
3.  **`uuid` package**: The `uuid` package was added as a dependency for generating unique IDs for `localStorage` items.

### Adapter File Strategy:
The `src/services/api.ts` file now serves as the central data access layer, abstracting whether data comes from the Base44 SDK or `localStorage`. UI components will interact solely with this `api` object, ensuring that the application remains decoupled from the specific backend implementation. This adheres to the architectural rule of centralizing all data/API calls to simplify future backend transitions (e.g., to a custom VPS/PostgreSQL setup).

### Running on a Private Server:
The `localStorage` fallback in `src/services/api.ts` allows the frontend application to function independently of the Base44 backend during development or if deployed with a separate custom backend.
*   If running on a private server with a custom backend, the `api.ts` adapter would be updated to point to the new backend's API endpoints. The `localStorage` fallback would typically be removed or conditionalized for development purposes only.
*   The build and serving steps remain the same as previously documented.

### Validation:
The `SuccessGoal` JSON schema is correctly formatted. The `src/services/api.ts` file is written in TypeScript and includes type definitions for `Goal`. The `npm run build` command is expected to pass cleanly after installing the new `uuid` dependency.

## 2026-11-01 - Transform Home.jsx into Complete Interactive Success Planner Dashboard

### Implemented:
1.  **`src/pages/Home.jsx`**: The "Winner" placeholder was replaced with a complete interactive Success Planner dashboard.
    *   It now displays an "Overall Life Progress Gauge" based on the average progress of all goals.
    *   Shows the "Top 3 Goals" with their progress.
    *   Presents an "Active Goals List" featuring progress bars, interactive milestone checkboxes, and "+5% Progress" buttons that update goal progress via the `api` adapter.
    *   Includes a "Quick Add Goal" modal/form for creating new goals, leveraging the `api.createGoal()` method.
2.  **UI Components**: Several reusable UI components (Button, Card, Progress, Dialog, Input, Label, Select, Textarea, Checkbox) were created under `src/components/ui/` to build the dashboard, following a `shadcn/ui`-like pattern. These components use `class-variance-authority`, `@radix-ui/react-slot`, `@radix-ui/react-progress`, `@radix-ui/react-dialog`, `@radix-ui/react-label`, `@radix-ui/react-select`, `@radix-ui/react-checkbox`, and `lucide-react` for their underlying functionality and styling.
3.  **Dependencies**: New dependencies (`class-variance-authority`, `@radix-ui/react-slot`, `@radix-ui/react-progress`, `@radix-ui/react-dialog`, `@radix-ui/react-label`, `@radix-ui/react-select`, `@radix-ui/react-checkbox`, `lucide-react`) were added for the UI components to function.

### Adapter File Strategy:
The `src/pages/Home.jsx` component strictly adheres to the Decoupling Rule by interacting solely with the `api` object from `src/services/api.ts` for all data operations (fetching, creating, updating goals). This ensures that the UI remains independent of the backend implementation (Base44 SDK or `localStorage` fallback).

### Running on a Private Server:
The dashboard will run on a private server by building the application (`npm run build`) and serving the static files. The `api.ts` adapter's `localStorage` fallback allows the dashboard to be fully functional even without a Base44 backend, making it suitable for custom server deployments. If a custom backend is used, the `api.ts` file would be updated to point to that backend's endpoints.

### Validation:
The project is expected to compile cleanly with `npm run build` after installing the new dependencies. The UI components are built using React and TypeScript (implicitly, as the project is JavaScript with TS files), and their integration into `Home.jsx` should not introduce syntax or TypeScript errors. The interactive elements (progress buttons, add goal form) are designed to persist changes via the `api` layer.
