# Architecture Contract — Nomadly

This document defines the strict architectural rules, boundaries, and governance standards for the Nomadly codebase. All new code and refactorings must comply with this contract.

---

## 1. Technology Stack

* **Client**:
  * Core: React (v19.1), Redux Toolkit, React Router DOM (v7.9), Axios, Socket.io-client.
  * Styling: TailwindCSS (v3), Headless UI, Lucide React.
  * Icons Policy: Direct imports of icons from 'lucide-react' inside client features or components are strictly forbidden. All icons must be rendered using the central custom `<Icon>` wrapper component (defined in `client/src/ui/icon/Icon.tsx`) to enforce a single consistent styling interface.
  * Forms: React Hook Form (Standardized).
* **Server**:
  * Core: Node.js (v24), Express (v5.1), Socket.io.
  * Validation: Zod.
  * Database: MongoDB + Mongoose (v8.16).
  * Storage: Cloudinary (Multer storage).
* **Common**:
  * Shared types are compiled in the root `/shared` folder.

---

## 2. Folder Ownership & Domain Boundaries

The application is structured as a domain-driven monorepo with three root folders: `/client`, `/server`, and `/shared`.

### Domain Boundaries
We organize features by business domains, not by UI page hierarchies. The application domains are:
1. **Auth & Identity** (User accounts, registration, credentials, login, Google OAuth).
2. **Trips & Core Workspace** (Trip lifecycles, permissions, basic info, covers, sharing).
3. **Itinerary & Destinations** (Stops, coordinates, dates, chronological routing).
4. **Budget & Finance** (Base budgets, expenses, member splits, contributions).
5. **Tasks & Collaboration** (Shared todo lists, task assignments, status tracking).
6. **Chat & Realtime** (Sockets messaging, room-snooping protections).
7. **Invitations & Invites** (Trips access requests, member addition flows).

### Directory Rules
* **Features Folder (client/src/features)**:
  * EVERY feature belongs inside a domain folder under `features/`.
  * Structure inside a feature must follow: `/components`, `/hooks`, `/store`, `/types`, `/validators` (or `/utils`).
  * **Explore Boundaries**: The public itinerary discovery module resides inside `features/explore/`.
* **Shared Types Folder (shared/types)**:
  * Holds all TypeScript definitions shared between client and server.
  * Application files must import shared types using the `@shared/types` compiler alias.

---

## 3. State Management Rules

State lives in one of two places based on usage:

1. **Global Store (Redux Toolkit)**:
   * **Scope**: Persisted state, cross-page parameters, global session configurations.
   * **Allowed slices**: `auth` (session details), `trips` (list cache & active workspace metadata), and `ui` (global layout).
2. **Local Hook State (`useState` / SWR / local cache)**:
   * **Scope**: Module-specific resource caching (e.g., destinations, budget expenses, stays, task details).
   * **Rule**: Sub-workspace modules must manage their data loading state locally using React hooks. Do not populate the global Redux store with transient workspace lists.

---

## 4. API Layer Contract

* **Central Client**: All requests go through the Axios instance in client/src/services/api.ts.
* **Access Token Injection**: The Axios request interceptor injects the Bearer token automatically. The Axios instance subscribes to Redux changes to ensure access tokens stay synchronized.
* **Token Rotation (CSRF + Refresh)**: The Axios response interceptor catches 401s, halts the request queue, fetches a new token from `/auth/refresh` (transmitting the CSRF header), and replays pending requests.
* **Request Wrappers**:
  * API routes must be defined in Service files (`*.service.ts`) located in client/src/services.
  * Direct inline `api.post(...)` or `axios.get(...)` calls inside React components are forbidden.
  * **Auth Exception**: Authentication-related requests (login, register, logout, google auth) are managed directly within the Redux Thunks (`client/src/features/auth/store/authThunks.ts`) and auth utils (`client/src/features/auth/utils/auth.ts`) which serve as the state-bound service layer for authentication.
* **Response Normalization**: Service wrappers must normalize raw Axios response structures, extracting and returning only relevant data fields or entities.
* **Error Propagation**: Service functions must catch connection failures and throw formatted error strings utilizing the `extractApiError(error as ApiError, fallback)` utility.

---

## 5. Validation Pattern

### Client-Side Validation
* **Standard**: **React Hook Form (RHF)** is the singular system-wide standard for all forms (including full-page components like login/profile, and collaborative popups/modals like stays, destinations, and tasks).
* **Rule**: Forms must register constraints directly inside RHF fields. Custom local state inputs that manually validate fields are forbidden.
* **No Hybrid Validation Checks**: Forms utilizing RHF must not run manual validation checks (e.g., executing separate validation functions) inside the `onSubmit` handler. All field constraints must be registered and handled natively via RHF rules or schemas.

### Server-Side Validation
* **Rule**: Multi-layered validation is required:
  1. Express Controller: Fast parameter presence/type validation checks.
  2. Mongoose Schema: Structural validation constraints (regex match, coordinate constraints, date chronological checks).
* Centralized middleware catches `ValidationError` to map it to JSON errors automatically.

---

## 6. DB Access Pattern

* **Controller Layer Boundary**: Controllers must never import Mongoose models or run raw queries.
* **Layer Sequence**: `Router -> Controller -> Service -> Model -> Database`.
* **Cross-domain Queries**: A service from one domain (e.g., `invitations`) must query users via the `userService` layer rather than importing the `User` model directly.
* **Sockets DB Access**: Sockets connections must delegate all queries and mutations to service classes (e.g. `chatService.saveMessage(...)`) instead of directly executing model queries inside socket handlers.
* **Public-Facing Serializers (Social/Profile)**: Public-facing serializers must be explicitly allow-listed, returning only predefined fields (e.g. `publicProfileUser` returning only `username`, `name`, `profilePicUrl`, `bio`, and computed counts). They must never be derived by omitting/filtering fields from an authenticated-user serializer, to prevent accidental leakage of sensitive fields like `email`.

---

## 7. Naming Conventions

### Files and Folders
* **Filenames**: All files must use dot-separated singular snakeCase/camelCase, reflecting their layer type:
  * `*.controller.ts` (Never pluralize to `*.controllers.ts`)
  * `*.service.ts`
  * `*.routes.ts`
  * `*.model.ts`
  * `*.types.ts`
* **Directories**: Always use lowercase.

### Code Symbols
* **Router Exports**: Express routers exported from a module index barrel must follow the format `xxxRouter` (e.g., `authRouter`, `userRouter`, `tripRouter`). Routers must not use the `xxxRoutes` suffix.
* **React Components**: Always use PascalCase (e.g., `DestinationCard.tsx`).
* **React Hooks**: Always prefix with `use` (e.g., `useDestinations.ts`).

---

## 8. Request Validation & Security Strategy

* **Schema-Based Request Validation**:
  * Request payload validation is enforced at the Express router boundary using Zod schemas. Manual field/type checks inside controllers are strictly prohibited for schema-validated routes.
  * Zod schemas must be colocated with route files (e.g., `trip.schema.ts` next to `trip.routes.ts`) and must inherit types from root `/shared` definitions.
  * Validation errors must respond with a `400` status code carrying a consistent error shape matching Mongoose validation errors: `{ success: false, message: 'Validation error', errors: string[] }`.
* **CSRF Protection**:
  * Any route authenticating via session cookies (such as refresh and logout) must enforce CSRF protection.
  * CSRF validation must be run as route-level middleware using `csrfProtection` which verifies that the `x-csrf-token` header matches the `csrf_token` cookie.

---

## 9. Error Handling Strategy

* **API Error Representation**:
  * Generic JavaScript `Error` objects with string comparison checking (e.g. `throw new Error('Trip not found')`) are strictly prohibited in service domains.
  * All modules (including trips, budget, accommodations, etc.) must define custom typed error classes extending a base application error class, mapping to specific error code enums (like `AuthError` and `UserError`) for response parsing.
* **Client-Side Normalization**:
  * Client components and hooks must consistently resolve errors using the centralized `extractApiError` utility from [`client/src/utils/errorHandling.ts`].
  * Inline catch blocks must not configure manual toast warnings; instead, components should wrap async operations using centralized async handlers or action utilities (like the `useAsyncAction` hook) to automate user-facing alert delivery.
* **Error Bubbling**: Services throw custom typed errors; Express controllers catch, resolve, and bubble unhandled issues via `next(err)`.

---

## 10. Code Limit Guidelines

* **Component Length**: A single component or hook file should not exceed **300 lines**.
* **Responsibility Threshold**: If a component handles more than one major task (e.g. rendering UI + layout + local mapping state + editing modal logic), it must be split into sub-components.

---

## 11. Dependency Management

* **Pre-requisite ADR**: Before installing any new dependency, the author must create a one-line justification in DECISIONS.md detailing why an existing dependency or custom helper is insufficient.

---

## 12. Testing Rules

* **Scope**: All business-critical logic, permissions checking algorithms, and financial split utils must be tested with Vitest.
* **Exemptions**: Client-side UI visual layout is out of scope.

---

## 13. Stability Tiers

Modules in Nomadly are classified under two stability tiers:

| Tier | Scrutiny Level | Change Requirements | Modules |
| :--- | :--- | :--- | :--- |
| **STABLE** | High | Architectural changes require a formal ADR entry in DECISIONS.md before execution. | `auth`, `users`, `invitations`, `trips/core`, `trips/budget`, `trips/chat`, `trips/tasks`, `trips/accommodations` |
| **STABLE (Navigation)** | High | Requires visual verification across views and a formal ADR entry for routing/layout adjustments. | `app-shell/navigation` (AppLayout, Sidebar, MobileSidebar, useNavigation, uiSlice) |
| **EXPERIMENTAL** | Low | Fast prototyping is allowed. ADR only required when promoting to STABLE. | `explore`, `trips/memories`, `maps` |

---

## 14. Roadmap Prioritization & AI Philosophy

To establish a highly stable core, all development, refactoring, and feature additions must adhere to the following sequence and design constraints:

### Backend-First Prioritization Sequence
We prioritize foundational stability over front-facing features. The development sequence is:
1. **Authentication & Authorization**: Hardening user sessions, route guards, token rotators, and member privilege controls.
2. **Robust Backend Architecture**: Enforcing schema validators, structured logging integration, and centralized framework error mapping.
3. **API Design & Documentation**: Standardizing request/response formats and generating OpenAPI specs.
4. **Real-time Collaboration**: Integrating WebSocket event architectures where it actively benefits user cooperation.
5. **Contextual AI Features**: Deeply integrating AI solutions *only* after items 1-4 are solid. "Bolted-on" homepage AI chatbots are strictly forbidden.

### AI Integration Philosophy
* **AI as a Backend Dependency**: AI engines, prompts, and Large Language Model wrappers must be treated as regular backend integrations (similar to email dispatchers or maps APIs).
* **Rule**: AI must not dictate the core database schema or control application flow. The core business rules and relational schemas must remain independent, consuming AI outputs as external data payloads.
