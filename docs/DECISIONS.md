# Architecture Decision Log — Nomadly

This log tracks all significant architectural decisions in the Nomadly codebase.

---

## Choice of MongoDB/Mongoose as the Database System
**Status:** Accepted

**Context:**
The application demands highly dynamic, nested travel documents (e.g., trips containing member lists with active/past statuses, nested budget expenses, and destinations with varying coordinates/notes). 

**Decision:**
Use MongoDB via Mongoose. All database models are declared inside Mongoose schemas, such as `server/src/modules/trips/core/trip.model.ts` and `server/src/modules/trips/destinations/destination.model.ts`.

**Alternatives considered:**
PostgreSQL was considered. While Postgres provides strict transaction isolation, mapping highly dynamic, deeply nested document segments like member rules, splits, and completions arrays would require complex JSONB operations or extensive tables and joins. MongoDB handles these hierarchies natively.

**Consequences:**
* **Pros**: Simplifies document modifications and allows rapid schema evolution.
* **Cons**: Relational integrity and cross-document references (e.g., member validation against User records) must be managed at the application layer rather than by the database engine.

---

## Dual State Management Strategy (Redux + Local Component Hooks)
**Status:** Accepted

**Context:**
Storing all domain data in Redux causes boilerplate bloat and synchronization issues across pages. Conversely, using only local state makes cross-page persistence (like authentication credentials and workspace context) impossible.

**Decision:**
Standardize on Redux Toolkit for global session entities (`auth`, `trips` lists, and `ui` states) and local `useState` hooks inside modules (like `destinations`, `budget`, `accommodations`, and `tasks`) populated on demand by custom hooks and services.

**Alternatives considered:**
Single Source of Truth in Redux. Putting all transient workspace data (like destinations list or expenses list) into Redux was rejected because it introduces unnecessary slice/thunk overhead for data that is only relevant to a single component subtree.

**Consequences:**
* **Pros**: Keeps the global Redux store clean and isolates local modifications.
* **Cons**: Requires explicit callbacks or reload hooks when adjacent module subtrees need to share data updates.

---

## Standardize on React Hook Form (RHF) for Client Forms
**Status:** Accepted

**Context:**
The client implements five different validation and error reporting strategies, ranging from RHF inline checks to custom hooks and toast warnings. This makes form handling unpredictable.

**Decision:**
Require React Hook Form (RHF) for all forms. Legacy manual bindings have been fully migrated to RHF, and hybrid checks in submit handlers are banned.

**Alternatives considered:**
Custom react form state hooks (like `useCreateTripForm.ts`). While custom validation requires no external libraries, it adds complex state logic and fails to support standard field register events.

**Consequences:**
* **Pros**: Unifies client form rendering, simplifies validation rules, and ensures native browser event integration.
* **Cons**: Introduces a dependency requirement for all forms.

---

## Deprecation and Deletion of ownership.middleware.ts
**Status:** Accepted (Refactored)

**Context:**
The Express authorization middleware `server/src/modules/trips/core/ownership.middleware.ts` is disconnected from routes. Furthermore, its `verifyTripAccess` method lacks member checks, which would block legitimate collaborators on private trips.

**Decision:**
Delete `ownership.middleware.ts`. Delegate access validations to service-layer helpers (like `canAccessTrip` in `trip.utils.ts` and `canModifyTripResources` in `member.permissions.ts`).

**Alternatives considered:**
Fixing and registering the middleware. Rejected because it would require redundant DB queries (once in middleware, once in service/controller) and violates the service-layer validation strategy.

**Consequences:**
* **Pros**: Simplifies route definitions and ensures membership permissions are handled correctly.
* **Cons**: Requires developers to call service-layer permission checks explicitly.

---

## Enforcing Strict DB Service Layer Boundary
**Status:** Accepted (Refactored)

**Context:**
Some entrypoints bypass the service layer. `server/src/modules/invitations/invitation.controller.ts` queries the `User` model directly, and `server/src/sockets/index.ts` executes raw Mongoose queries and writes (`Message.create`, `Trip.findById`).

**Decision:**
Refactor these locations to route all DB calls through services. Enforce strict controller-to-service boundaries in `ARCHITECTURE.md`.

**Alternatives considered:**
Bypassing for sockets/cross-domain queries. Rejected as it creates technical debt and leads to redundant code implementation.

**Consequences:**
* **Pros**: Guarantees business rules are consistently applied.
* **Cons**: Adds thin wrapper methods in services.

---

## Singular Filename and xxxRouter Suffix Naming Conventions
**Status:** Accepted

**Context:**
Naming conventions are inconsistent (`task.controllers.ts` is plural, `memberRoutes` uses `Routes` instead of `Router`).

**Decision:**
Standardize on singular filenames (e.g., `*.controller.ts`) and the `xxxRouter` export suffix.

**Alternatives considered:**
Plural filenames and `xxxRoutes`. Singular is standard in the Express ecosystem.

**Consequences:**
* **Pros**: Unifies server import patterns, making autocompletion and template generation predictable.
* **Cons**: Requires renaming existing legacy files.

---

## Relocation of Explore Page to Features Directory
**Status:** Accepted (Refactored)

**Context:**
The public itinerary view is located in `client/src/pages/explore`, violating feature-first domain organization.

**Decision:**
Move the module to `client/src/features/explore/`.

**Alternatives considered:**
Keeping a separate `pages` folder. Rejected because page components grow complex and benefit from feature-scoped subfolders.

**Consequences:**
* **Pros**: Maintains feature isolation.
* **Cons**: Requires updating routes in `App.tsx`.

---

## Custom Error Classes Over String Matching
**Status:** Accepted

**Context:**
Modules like Trips and Destinations throw generic errors with string messages (`TRIP_PRIVATE`, `Trip not found`), leading to brittle string checks in controllers.

**Decision:**
Standardize on custom typed Error classes with compiled code enums.

**Alternatives considered:**
String message checking. String matching is prone to typos and lacks compiler checks.

**Consequences:**
* **Pros**: Increases type safety.
* **Cons**: Requires coding custom classes for new domains.

---

## Known Deferred Refactoring: Missing Auth Client Service Wrapper
**Status:** Accepted (Deferred)

**Context:**
Unlike all other client modules, the `auth` module does not have a separate API service class wrapper in the `services/` directory. Instead, the axios endpoint calls are inlined directly within `client/src/features/auth/store/authThunks.ts`.

**Decision:**
Accept the current inlined implementation as a known deferred technical debt. Standardize it into a dedicated `auth.service.ts` file in the services directory when convenient during future auth/profile updates.

**Alternatives considered:**
Refactoring immediately. While low risk, immediate refactoring was deferred to prioritize core feature cleaning and alignment.

**Consequences:**
* **Pros**: Prevents scope creep.
* **Cons**: Keeps a small inconsistency in API request layering active in the frontend.

---

## Roadmap Prioritization Sequence and AI Design Philosophy
**Status:** Accepted

**Context:**
Modern full-stack systems often suffer from architectural instability when high-level features (like AI assistants or real-time features) are built on top of weak access control, raw database layers, or unstructured API interfaces. There is also a risk of treating AI as the center of the application rather than an API-driven utility.

**Decision:**
1. Enforce a strict "Backend-First" priority roadmap: hardening Authentication & Authorization -> Robust Backend (validation, logging, error handling) -> API Design/Docs -> Sockets -> AI.
2. Freeze deep AI integrations until the backend is fully stabilized.
3. Treat AI integrations as simple backend service dependencies, separating core database/flow rules from dynamic LLM outputs.

**Alternatives considered:**
Integrating AI early to showcase a prototype. Rejected because it leads to technical debt, security gaps, and unstable database schema dependencies.

**Consequences:**
* **Pros**: Guarantees a highly secure, stable, and well-designed core that can scale reliably.
* **Cons**: Delays public AI feature releases until foundational architecture requirements are met.

---

## Centralized Icon Wrapper and Frontend Guardrails
**Status:** Accepted

**Context:**
Direct imports from `lucide-react` in features make styling overrides difficult. Furthermore, direct Axios API requests inside components bypass normalization, validation, and centralized error mapping.

**Decision:**
1. Require the custom central `<Icon>` wrapper component (defined in `client/src/ui/icon/Icon.tsx`) for all client-side icons. Direct imports from `lucide-react` in page/feature files are forbidden.
2. Mandate that all API routes be declared inside service files under `client/src/services/`. Direct inline `api.get` / `api.post` calls inside component hooks/effects are prohibited.
3. Enforce a strict maximum component/hook file length of **300 lines**, splitting layouts and tabs into dedicated sub-components where needed.

**Alternatives considered:**
Allowing inline API requests and direct Lucide imports. While slightly faster for prototyping, this compromises visual consistency, replicates request wrappers, and violates standard error-handling bounds.

**Consequences:**
* **Pros**: Unifies client layouts, isolates transient requests, keeps page controllers readable, and ensures robust API error wrapping.
* **Cons**: Requires registering new icons in `Icon.tsx` and adding thin wrappers in service modules.

---

## Mandating Centralized Service Layer for HTTP Queries
**Status:** Accepted

**Context:**
Components like [ProfilePage.tsx](../client/src/features/profile/pages/ProfilePage.tsx) and cloning pages execute direct inline Axios calls (e.g. `api.get("/users/me")`, `api.post("/trips/:tripId/clone")`) bypassing standard service files in `client/src/services`.

**Decision:**
All API requests must be defined inside service modules. Components are prohibited from directly invoking the Axios instance. Cloning must be wrapped in `trips.service.ts` and user profile logic in `users.service.ts`.

**Alternatives considered:**
Inline Axios requests inside component lifecycle effects. Rejected because it bypasses response serialization, duplicates routing constants, and leads to unhandled/fragmented error messages.

**Consequences:**
* **Pros**: Guarantees all API calls are centralized and documented, types are consistently mapped, and connection errors are globally caught and parsed.
* **Cons**: Requires minor wrapper code blocks inside service layers.

---

## Standardization of React Hook Form (RHF) and Banning Hybrid Validation
**Status:** Accepted

**Context:**
Feature components manage input validation inconsistently. Large screens (`Login.tsx`, `ProfilePage.tsx`) use `react-hook-form`, while sub-workspace modals (`AccommodationFormModal.tsx`, `DestinationFormModal.tsx`) use manual React state checking. Furthermore, `Login.tsx` implements a hybrid model: registering field requirements inside RHF but manually validating credentials using custom regex inside `onSubmit`.

**Decision:**
1. Propose standardizing on RHF for all forms, including collaborative modals (stays, destinations, tasks).
2. Ban hybrid checks: all inputs must validate natively through RHF constraints or registered schemas rather than running manual checks in submit handlers.

**Alternatives considered:**
* Keeping manual React state for modals: Rejected because manual state variables bloat component code, lack native access to RHF error bindings, and break layout uniformity.
* Continuing the hybrid validator pattern in `Login.tsx`: Rejected as it duplicates logic and bypasses standard form lifecycle structures.

**Consequences:**
* **Pros**: Unifies forms and accessibility structures, simplifies layout components, and ensures consistent error rendering interfaces.
* **Cons**: Requires refactoring existing state binders in modals and tasks.

---

## Centralizing Backend Custom Errors and Client Error Extraction
**Status:** Accepted

**Context:**
Workspace domains (stays, destinations, budget) throw standard JavaScript `Error` objects carrying plain text messages (e.g. `throw new Error('Trip not found')` in `server/src/modules/trips/budget/budget.service.ts`), which results in brittle string comparison checks in controllers. On the client, caught errors are resolved inconsistently: some components capture raw error messages and dispatch manual toast alerts.

**Decision:**
1. Require all backend domains to define custom error classes (extending a common app class) with typed error code enums.
2. Standardize client-side error normalization on the centralized `extractApiError` helper in `client/src/utils/errorHandling.ts`.
3. Require asynchronous actions to wrap calls inside helper hooks like `useAsyncAction` to manage indicators and trigger toast warnings automatically.

**Alternatives considered:**
Standard string-based error checking. Rejected because simple text matching is prone to typos, lacks type safety, and is hard to localize or match across architectural borders.

**Consequences:**
* **Pros**: Centralizes HTTP status codes mapping, isolates transient errors, and ensures visual consistency for all toast messages.
* **Cons**: Requires writing custom error classes for new services and using action wrappers.

---

## Deferred Request Validation Migration (First Pass)
**Status:** Tracked (Deferred)

**Context:**
As part of the initial implementation of Zod schema-based request validation (defined in the Request Validation Contract), we migrated the primary high-risk, frequently modified modules (`auth`, `users`, `trips/core`, and `trips/budget`). The remaining modules have their validation migration deferred to a future pass.

**Decision:**
Defer request validation schema attachment for the following modules:
1. `explore` routes (`server/src/modules/explore/explore.routes.ts`)
2. `invitations` routes (`server/src/modules/invitations/invitation.routes.ts`)
3. `trips/accommodations` routes (`server/src/modules/trips/accommodations/accommodation.routes.ts`)
4. `trips/chat` routes (`server/src/modules/trips/chat/chat.routes.ts`)
5. `trips/destinations` routes (`server/src/modules/trips/destinations/destination.routes.ts`)
6. `trips/members` routes (`server/src/modules/trips/members/member.routes.ts`)
7. `trips/memories` routes (`server/src/modules/trips/memories/memory.routes.ts`)
8. `trips/tasks` routes (`server/src/modules/trips/tasks/task.routes.ts`)

These files will be updated in a subsequent pass to apply schema validations natively at the router boundary.

**Alternatives considered:**
Migrating all 13 route modules simultaneously. Rejected due to validation testing scope, ensuring we validate stability on primary components first.

**Consequences:**
* **Pros**: Limits risk in the first migration step, allowing thorough coverage of core paths.
* **Cons**: Temporary inconsistency where some route parameters rely on manual service/controller checks instead of uniform schema validations.

---

## Navigation & Page Structure Compaction (3-page to 2-page Consolidation)
**Status:** Accepted

**Context:**
The platform layout was fragmented across three primary destinations: Dashboard (which lacked a clear content identity), My Trips, and Explore (which felt isolated with low discoverability). There was also redundant sidebar navigation links. Additionally, visual styles were inconsistent: Dashboard/My Trips used a subtle/restrained visual token set, while Explore/Saved Trips carried bolder gradients and non-standard border radiuses.

**Decision:**
1. Consolidate Dashboard and Explore highlights into a single Home destination (routed to `/home`).
2. Move Saved Trips out of a standalone page and integrate them directly as a tab inside My Trips page, retrieving bookmarked public itineraries via `fetchSavedTripsAPI` and showing read-only bookmarks actions (unsave, clone).
3. Update primary menu options to exactly: Home, My Trips, AI Planner, and Community. Keep `/explore` and `/explore/trips/:tripId` as functional routes reachable only via highlights/bookmark CTA entrypoints.
4. Standardize explore cards and empty states to standard `rounded-xl`, `font-semibold` / `font-bold` headings, and default shadows.
5. Fix the sidebar collapse bug in `AppLayout.tsx` by removing the forced route-based collapse trigger entirely, making the sidebar state purely user-driven.

**Alternatives considered:**
- Full discovery-feed-as-home approach: Rejected to keep user's active/upcoming trip priorities front and center.
- Retaining 3 separate pages: Rejected due to menu bloat and low discoverability of bookmarked vs owned trips.

**Consequences:**
- **Pros**: Cleaner visual layout, standardized design tokens, reduced cognitive overhead, and consistent sidebar behavior.
- **Cons**: Public exploration interface is no longer visible on the primary menu and is only accessible via search clicks or detail CTAs.


