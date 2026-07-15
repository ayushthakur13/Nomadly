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
Require React Hook Form (RHF) for all new forms (e.g., profiles, social layer features). Existing forms remain as-is but are scheduled for refactoring.

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
