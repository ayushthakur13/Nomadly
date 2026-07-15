# Architecture Contract — Nomadly

This document defines the strict architectural rules, boundaries, and governance standards for the Nomadly codebase. All new code and refactorings must comply with this contract.

---

## 1. Technology Stack

* **Client**:
  * Core: React (v19.1), Redux Toolkit, React Router DOM (v7.9), Axios, Socket.io-client.
  * Styling: TailwindCSS (v3), Headless UI, Lucide React.
  * Forms: React Hook Form (Standardized).
* **Server**:
  * Core: Node.js (v24), Express (v5.1), Socket.io.
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

---

## 5. Validation Pattern

### Client-Side Validation
* **Standard**: **React Hook Form (RHF)** is the required standard for all forms.
* **Rule**: All new forms (e.g., user profiles, social likes/saves) must register validation rules inside RHF fields, showing inline errors beneath invalid fields. Custom manual state validators are deprecated for new features.

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

## 8. Error Handling Strategy

* **API Error Representation**:
  * Generic JavaScript `Error` objects with string comparison checking (e.g. `error.message === 'Trip not found'`) are deprecated.
  * All modules must implement custom typed error classes derived from a common application error class, using structured code enums (e.g., `AuthError` and `AUTH_ERRORS`) for status code mapping.
* **Error Bubbling**: Services throw custom typed errors; Express controllers catch, resolve, and bubble unhandled issues via `next(err)`.

---

## 9. Code Limit Guidelines

* **Component Length**: A single component or hook file should not exceed **300 lines**.
* **Responsibility Threshold**: If a component handles more than one major task (e.g. rendering UI + layout + local mapping state + editing modal logic), it must be split into sub-components.

---

## 10. Dependency Management

* **Pre-requisite ADR**: Before installing any new dependency, the author must create a one-line justification in DECISIONS.md detailing why an existing dependency or custom helper is insufficient.

---

## 11. Testing Rules

* **Scope**: All business-critical logic, permissions checking algorithms, and financial split utils must be tested with Vitest.
* **Exemptions**: Client-side UI visual layout is out of scope.

---

## 12. Stability Tiers

Modules in Nomadly are classified under two stability tiers:

| Tier | Scrutiny Level | Change Requirements | Modules |
| :--- | :--- | :--- | :--- |
| **STABLE** | High | Architectural changes require a formal ADR entry in DECISIONS.md before execution. | `auth`, `users`, `invitations`, `trips/core`, `trips/budget`, `trips/chat`, `trips/tasks`, `trips/accommodations` |
| **EXPERIMENTAL** | Low | Fast prototyping is allowed. ADR only required when promoting to STABLE. | `explore`, `trips/memories`, `maps` |
