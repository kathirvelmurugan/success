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
