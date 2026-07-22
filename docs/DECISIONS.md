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

## Auth Client Service Wrapper Standardization
**Status:** Completed ✅ (Supersedes Deferred Pass)

**Context:**
Originally, unlike all other client modules, the `auth` module lacked a dedicated API service wrapper in `client/src/services/`. Instead, Axios calls were inlined inside `authThunks.ts`, `auth.ts` utils, and `App.tsx`.

**Decision:**
1. Created `client/src/services/auth.service.ts` encapsulating `loginAPI`, `signupAPI`, `googleLoginAPI`, `refreshSessionAPI`, and `logoutAPI`.
2. Refactored `authThunks.ts`, `useLogout.ts`, and `App.tsx` to delegate all HTTP traffic to `auth.service.ts`.
3. Deleted redundant `client/src/features/auth/utils/auth.ts` file and unified logout logic around `useLogout()` hook.

**Consequences:**
* **Pros**: 100% architectural consistency across all client domains; standardized API naming (`loginAPI`, `logoutAPI`); centralized error handling via `extractApiError`.
* **Cons**: None.

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

## Request Validation Migration (Fully Completed)
**Status:** Completed ✅ (Supersedes First Pass Deferral)

**Context:**
Originally, Zod schema-based request validation was applied to primary core modules (`auth`, `users`, `trips/core`, and `trips/budget`). The remaining write endpoints were deferred. In the final pass, Zod schemas were created and attached to all remaining write endpoints across all feature modules.

**Decision:**
1. Created dedicated Zod schema files (`destination.schema.ts`, `accommodation.schema.ts`, `task.schema.ts`, `member.schema.ts`, `invitation.schema.ts`, and `cloneTripSchema`).
2. Attached `validate(schema)` middleware to all `POST`, `PATCH`, and `PUT` write entrypoints across `destinations`, `accommodations`, `tasks`, `members`, `invitations`, and `trips/core`.

**Consequences:**
* **Pros**: 100% end-to-end payload boundary validation across all write API routes; standardized 400 Bad Request error responses; full TypeScript DTO alignment.
* **Cons**: None.

---

## Navigation & Page Structure Compaction (3-page to 2-page Consolidation)
**Status:** Superseded by Home/My Trips Re-merge and Explore Restoration to Primary Navigation

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

---

## Home/My Trips Re-merge and Explore Restoration to Primary Navigation
**Status:** Accepted

**Context:**
The previous consolidation merged Dashboard into Home and folded Explore into it as an embedded highlights strip, keeping My Trips separate. In practice, this left the Home page nearly empty for new users with few trips (since it duplicated My Trips features) and made Explore hidden and undiscoverable. We are amending this layout to provide a richer experience for users with few trips, and restore primary discovery capabilities.

**Decision:**
1. Merge the full trips tabs section (all, ongoing, upcoming, past, saved) from `MyTripsPage` directly into the surviving `HomePage` (`/home`), serving as a single personal dashboard.
2. Remove the "Explore highlights" strip (Trending Itineraries) from the `HomePage` layout, since Explore is restored to a primary navigation destination.
3. Delete the standalone `MyTripsPage` and redirect `/trips` and `/trips/saved` to `/home` and `/home?tab=saved`.
4. Restore `Explore` (`/explore`) to the main sidebar/navigation layout, changing primary destinations to: Home, Explore, AI Planner, and Community.
5. Standardize per-tab empty states on the Home page to have premium visual weight (icon, custom copy, plan/explore buttons) matching the zero-trips state.
6. Extract date-formatting into a shared `formatDateRange` utility and establish a unified overlay visual convention (shape, shadow, sizes) for card overlay badges and circular buttons in both `TripCard` and `ExploreGrid`.

**Alternatives considered:**
- Keeping the previous 3-page-flattened-to-2 structure: Rejected as it left Home empty and made Explore hidden.
- A fully discovery-feed-first Home page: Rejected to maintain focus on the user's personal travel blueprints.

**Consequences:**
- **Pros**: Home page now serves as a robust personal dashboard doubling as the full trip management view, and Explore has high discovery visibility again. Standardized visual conventions prevent UI style drift.
- **Cons**: No dedicated lightweight dashboard view exists anymore as all personal trip features are now consolidated in Home.

---

## Client-Side Inline Date Validation in Edit Modal
**Status:** Accepted

**Context:**
Setting a departure date after the return date (or vice versa) results in a backend validation error. Previously, the error toast displayed a generic "Validation error" because `extractApiError()` evaluated the general `message` field before checking the detailed `errors` list.

**Decision:**
1. Implement Option A (client-side validation): Calculate `isDateInvalid` dynamically when start or end dates are modified in `EditTripModal`. Show a clean, red inline alert block ("Return date must be after departure date") and disable the "Save changes" submit button.
2. Note on Option B (future improvement): While `extractApiError()` currently returns the first matched general `message` block, changing this order (checking `errors` array first) is deferred to avoid potential cascading regressions in other feature modules where general message checks are preferred. Inline form validations are preferred for direct user feedback.

**Consequences:**
- **Pros**: Instant user feedback inside the form before hitting the API, preventing invalid requests.
- **Cons**: Minor client-side date comparison overhead (negligible).

---

## Deployment: esbuild in Dependencies
**Status:** Accepted

**Context:**
- In the server package.json the build script directly invokes esbuild, not as part of a dev command or through a bundler like Webpack. This makes esbuild a runtime dependency of the build process itself.
- esbuild must remain in dependencies rather than devDependencies so it is available during production builds where devDependencies are omitted.

**Decision:**
1. Kept in dependencies, not devDependencies, because the deploy model installs and builds in the same environment.

**Alternatives considered:**
1. Installing esbuild as a devDependency: Rejected because the deploy model installs and builds in the same environment
2. Using Vite's build system: Rejected because Vite is not suitable for production builds

**Consequences:**
1. Build time can be up to 20-30% slower than expected in some environments, but the build can't silently break based on install flags.

---

## Trip and Destination Stop Date Range Boundary Constraints
**Status:** Accepted

**Context:**
Currently, the database and server-side service layers do not enforce that a destination stop's `arrivalDate` and `departureDate` lie within the overall trip's `startDate` and `endDate` boundaries. As a result:
- Users can save destination stop dates outside the trip's range.
- Users can update a trip's start/end dates to values that exclude existing scheduled stops.

**Decision:**
To balance data integrity with user flexibility, we implement Option C (Soft Validation / Client-Side Warnings) for now:
1. **Client-Side Soft Validation**: Show a non-blocking amber warning `FormAlert` in the Destinations itinerary list page and the Destination Edit modal if stop dates fall outside the trip dates. This raises awareness to the user without hard-blocking changes.
2. **Postponed Alternatives (A and B)**:
   - **Option A (Strict Validation Hard Block)**: Rejected for now because if a user shifts a 14-day trip forward by 2 days, a hard validation block would force them to manually edit every single destination stop before saving the trip date edit, resulting in severe UX friction.
   - **Option B (Date Shifting Auto-Sync)**: Pushing overall trip dates automatically calculates the day offset delta and updates all associated destination stops (and accommodation stays) in a database transaction. This is the ideal long-term solution, but deferred due to backend database update scope and complexity.

**Consequences:**
- **Pros**: High planning flexibility for users without submission blocks; clear warning cards guide users to align dates.
- **Cons**: Minor database inconsistency is technically permitted where stop dates exist outside trip limits.

---

## Decoupled Memories Visibility Settings & Conditional Tabs
**Status:** Accepted

**Context:**
- Previously, memories (photos) were automatically made public whenever a trip was published. The user requested memories to stay private by default even for public trips, with a settings toggle in the workspace so owners can choose to publish their memories.
- If memories are private, the Explore trip details view should not render the Memories tab. Additionally, unauthenticated guest users should still be able to interact with public memories in full screen (read-only mode) via a photo lightbox, matching the authenticated workspace gallery feature.

**Decision:**
1. **Private by Default**: Initialized `memoriesPublic: false` for all trips.
2. **Visibility Settings Toggle**: Built a Settings card toggle inside the workspace Memories module that updates the trip's `memoriesPublic` visibility settings via the Redux `updateTrip` thunk.
3. **Conditional Tabs**: Conditioned the rendering of the memories tab list in the Explore details view to only show when the trip is public and the creator has explicitly allowed public memories visibility.
4. **Guest Lightbox**: Integrated `MemoryLightbox` into the Explore memories panel, enabling guests to click images and view them in full screen (read-only mode).
5. **Populated Creator Patch**: Corrected backend `isTripCreator` member utility to properly validate populated createdBy objects to enable logged-in owners to see their own private memories on public detail pages.

**Consequences:**
- **Pros**: Granular privacy control over trip media assets; clean user interface for public template views.
- **Cons**: None.

---

## Sidebar Account Popover & Dashboard Relocation to /trips
**Status:** Accepted

**Context:**
- The bottom settings navigation button was a redundant placeholder item.
- Toggling/collapsing the sidebar caused shaky vertical shifts and visual layout gaps on certain navigation items.
- Navigating to `/home` (dashboard) felt disconnected from personal workspaces (`/trips/:tripId`) where no sidebar navigation item remained active.

**Decision:**
1. **Consolidated Settings & Logout**: Removed the bottom Settings list item and added an absolute-positioned floating popover menu triggered by the Profile card button (supporting user details, View Profile, Settings, and Log out actions, dismissible on click-outside).
2. **Layering Context**: Set `z-30` stack index on the outer sidebar wrapper so the floating menu floats on top of all page relative/sticky content elements.
3. **Dashboard Route Relocation**: Shifted the dashboard route from `/home` to `/trips`. Added a redirect mapping `/home` to `/trips` for backward compatibility.
4. **Simplified Active State Highlights**: Shifted active highlight path of the "My Trips" button to `/trips` and simplified the `isActive` matching rule to a standard prefix check, which automatically keeps the icon active for dashboard, creation, and trip workspace pages.

**Consequences:**
- **Pros**: Standard RESTful URL structure; visual spacing gaps resolved; smooth, hardware-accelerated collapse transitions; intuitive workspace visual context.
- **Cons**: None.

---

## Trip Preview Page Redesign, Relative Date Cloning & DRY Map/Validation Utilities
**Status:** Accepted

**Context:**
- The explore read-only trip detail view (`ExploreTrip.tsx`) used tab panels, had duplicated Mapbox URL building logic, and rendered raw currency strings instead of localized symbols.
- Cloning a trip blueprint copied fixed travel dates without shifting timeline pacing to the cloner's new calendar, failed to remove the original blueprint from the cloner's saved/bookmarked list, and failed to preserve `baseBudgetAmount`.
- Clone buttons lacked disabled loading spinners, causing multiple accidental duplicate clone API submissions.
- Date boundary out-of-bounds validation logic was duplicated across multiple form modals and list pages.

**Decision:**
1. **Single-Page Scrollable Trip Preview Page**: Renamed `ExploreTrip` to `TripPreviewPage`. Replaced tab panels with a continuous vertical scrolling layout featuring a 3-column Hero split (Cover, Metadata, Mapbox Preview) and interactive Itinerary Summary jump-cards.
2. **Relative Date Shifting & Automatic Unsave**: Calculated `dateOffsetMs` during cloning to dynamically shift destination stop dates, stay check-in/out dates, and task due dates relative to the new trip start date. Triggered `SavedTrip.deleteOne` upon successful cloning.
3. **Base Budget Target Preservation**: Preserved `baseBudgetAmount` as the target trip limit while resetting individual member contributions to ₹0. Updated `syncTripBudgetSummary` to fall back to `baseBudgetAmount` when member contributions are uncommitted.
4. **Shared Mapbox Static Map Hook (`useMapboxStatic`)**: Created a shared hook in `features/trips/_shared/hooks` encapsulating origin (`s`), intermediate stops (`1..99`), and destination (`d`) marker pin overlays for 100% DRY map rendering.
5. **Clone Button Disabled Loading State & Spinner**: Added loading spinner state and button disabling across all clone triggers (`TripPreviewHero`, `ExploreGrid`, `SavedTripCard`).
6. **DRY Date Validation Helpers**: Added `isDateOutOfBounds` and `isDateRangeOutOfBounds` to `src/utils/dateValidation.ts` and refactored destination and accommodation modules to use them for soft warning alerts.
7. **Complete Zod Schema Validation Across All Modules**: Created and attached Zod schemas (`destination.schema.ts`, `accommodation.schema.ts`, `task.schema.ts`, `member.schema.ts`, `invitation.schema.ts`, `cloneTripSchema`) to all remaining POST/PATCH/PUT write entrypoints via `validate()` middleware.

**Consequences:**
- **Pros**: Outstanding user experience for exploring public itineraries; 100% DRY Mapbox and date validation utilities; robust timeline and budget cloning logic; end-to-end Zod request boundary validation across all write API routes.
- **Cons**: None.
