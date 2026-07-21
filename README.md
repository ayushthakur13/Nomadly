# Nomadly

Nomadly is a modern collaborative full-stack travel planning platform designed to simplify group travel. It centralizes trip organization, itineraries, task assignments, budgeting, and real-time collaboration. Built with TypeScript, React, Express, and MongoDB, the project is designed for robust group travel management.

---

## Architecture & Governance

This repository adheres to a strict architectural contract. Before contributing or modifying the codebase, please review the following governance guidelines:
* [Architecture Contract](docs/ARCHITECTURE.md) — Tech stack, folder boundaries, state patterns, API layers, validations, naming, and error guidelines.
* [Architecture Decisions Log](docs/DECISIONS.md) — The ADR (Architecture Decision Record) tracking all past and accepted design selections.

---

## Why Nomadly

Group travel planning is often chaotic. People rely on WhatsApp, spreadsheets, notes, and multiple booking apps, which leads to confusion, duplicated effort, and coordination issues.

Nomadly solves this by:
- Centralizing all trip-related information in one platform
- Enabling real-time collaboration for groups
- Making travel plans structured, visual, and reusable
- Preparing the foundation for travel-focused social discovery

---

## Core Features

### Trip Management
- ✅ Create, update, and delete trips
- ✅ Add source and final destination
- ✅ Track trip status as upcoming, ongoing, or completed
- ✅ Upload and manage trip cover images
- ✅ Toggle trip visibility between public and private

### Destinations and Itineraries
- ✅ Multi-stop trips with detailed destinations
- ✅ Location search with map integration
- ✅ Store coordinates for accurate mapping
- ✅ Visualize trips using map pins for destinations and stops

### Task Management
- ✅ Create and assign tasks to trip members
- ✅ Role-based task completion
- ✅ Track deadlines and progress
- ✅ Filter tasks by status or member

### Budget and Expenses
- ✅ Create budget with trip members and planned contributions
- ✅ Add shared expenses with flexible split methods (equal, custom, percentage)
- ✅ Automatic calculation of spent and remaining budget
- ✅ Individual member expense tracking with per-member summaries
- ✅ Category-based expense organization
- ✅ Clone trip with budget (three modes: TEMPLATE, PLANNING, FULL_HISTORY)
- ✅ Trip cache synchronization for budget consistency

### Accommodations
- ✅ Add lodging details with check-in and check-out dates
- ✅ Store booking links, costs, and notes
- ✅ Centralized accommodation reference for the trip

### Memories and Media
- ✅ Upload trip photos securely (images-only: jpg/jpeg/png/webp, 5MB limit)
- ✅ Access control for uploading and deleting images
- ✅ Download shared image memories

### Members and Collaboration
- ✅ Invite members via email or username
- ✅ Accept or reject trip invitations
- ✅ Role-based permissions such as creator and member
- ✅ Real-time group chat using WebSockets 

---

## Roadmap

Future enhancements and planned features:
- **Itinerary Cloning**: Clone public trips to reuse itineraries for your own travels.
- **Social Discovery**: Explore public trips, follow travelers, and like/save itineraries.
- **AI-Powered Planning**: AI itinerary generation based on budget, duration, and interests.
- **Smart Day-Wise Planning**: AI generated budget breakdowns and recommendations for local experiences.
- **Shared Trips**: Open trips for shared joining with verified traveler profiles and SOS safety links.
- **Admin Dashboard**: Coordination tools for large community/organization managed trips.

---

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS
- Redux Toolkit
- React Hook Form
- Axios
- Mapbox for maps

### Backend
- Node.js with Express using TypeScript
- MongoDB with Mongoose
- JWT-based authentication
- Google OAuth
- Socket.io for real-time features
- Multer and Cloudinary for media uploads

### Development and Infrastructure
- Strict TypeScript configuration
- RESTful API architecture
- Modular and scalable project structure
- Environment-based configuration

---

## Project Structure

### Server (Modular Architecture)
```bash
src/
├── config/               # Configuration files (database, external services)
├── modules/              # Feature modules with domain-driven design
│   ├── auth/             # Authentication (login, register, Google OAuth, JWT)
│   ├── users/            # User profiles and settings
│   ├── trips/
│   │   ├── core/         # Trip CRUD operations (model, controller, service, routes)
│   │   ├── destinations/ # Multi-stop itinerary management
│   │   ├── members/      # Trip member management and permissions
│   │   ├── tasks/        # Trip tasks and to-do items
│   │   ├── budget/       # Budget and expense tracking
│   │   ├── accommodations/ # Lodging and booking management
│   │   ├── memories/     # Photo uploads and media storage
│   │   └── chat/         # Real-time trip chat
│   └── maps/             # Map integration and location services
├── shared/               # Shared utilities
│   ├── middlewares/       # Auth, ownership verification, error handling
│   ├── common-types/      # TypeScript interfaces and types
│   └── utils/             # Helper functions
├── sockets/              # WebSocket handlers for real-time features
├── app.ts                # Express app configuration
└── server.ts             # Server entry point
```

### Client (Feature-Driven Organization)
```bash
src/
├── assets/               # Static assets (icons, images, logos, illustrations)
├── constants/            # Centralized constants (toastMessages, etc.)
├── ui/                   # Reusable UI components organized by domain
│   ├── common/           # Shared components (navbar, sidebar, modals, footer)
│   ├── icon/             # Icon registry and component
│   └── layout/           # Main layout wrapper
├── features/             # Feature-specific modules with domain logic
│   ├── auth/             # Authentication flows, routes, and state
│   ├── explore/          # Public trip feed
│   ├── home/             # Trips dashboard list page
│   ├── invitations/      # Trip invitation handling
│   ├── landing/          # Landing page feature
│   ├── profile/          # User profile management
│   └── trips/            # Trip features (organized by subdomain)
│       ├── _shared/      # Shared hooks and utilities (workspace data, permissions, cache)
│       ├── browse/       # Trip browsing and filtering (MyTripsPage)
│       ├── create/       # Trip creation wizard (multi-step form)
│       ├── store/        # Redux state management (tripsSlice, tripsThunks)
│       └── workspace/    # Trip workspace (detail view with feature modules)
│           ├── modules/  # Feature modules (overview, tasks, budget, accommodations, members, memories, chat, destinations)
│           └── shell/    # Layout shell (header, sidebar, navigation)
├── hooks/                # Custom React hooks (global utilities)
├── services/             # API clients and external integrations
├── store/                # Redux Toolkit root store configuration
├── styles/               # Global styles and animations
├── utils/                # Utility functions (errorHandling, auth, debounce)
├── App.tsx               # Root component and routing
└── main.tsx              # React app entry point
```

---

## Documentation

For detailed documentation on architecture, features, and implementation details:

- **[Backend Documentation](docs/BACKEND_DOCUMENTATION.md)** — Comprehensive backend guide covering modules, API design, security, database, and deployment
- **[Frontend Documentation](docs/FRONTEND_DOCUMENTATION.md)** — Complete frontend guide covering React architecture, state management, services, hooks, and styling

---

## Architecture and Patterns

### Backend: Domain-Driven Modular Design
Each module (auth, users, trips, etc.) follows a consistent pattern:

```typescript
// Module structure example: modules/auth/
auth/
├── auth.controller.ts  // Handle HTTP requests/responses
├── auth.service.ts     // Business logic and database operations
├── auth.middleware.ts  // Request validation and error handling
├── auth.routes.ts      // Route definitions
├── auth.schema.ts      // Request validation and schema validation
├── auth.types.ts       // TypeScript types and interfaces
├── utils/              // Auth-specific utilities (JWT, CSRF)
└── index.ts            // Module barrel export
```

**Key Patterns:**
- **Separation of concerns**: Controller (HTTP layer) → Service (business logic) → Model (database)
- **Middleware-based auth**: JWT verification, CSRF protection, ownership validation
- **Error handling**: Centralized error codes and messages
- **Type safety**: Full TypeScript coverage with strict types
- **Database models**: Mongoose schemas with validation

### Frontend: Feature-Driven + Centralized Patterns
Organized by features with shared utilities:

**Async Operation Management** - The `useAsyncAction` hook eliminates boilerplate:
```typescript
const { execute, isLoading, error } = useAsyncAction({
  showToast: true,                    // Auto error toast
  errorMessage: 'Custom message',
  onSuccess: () => { /* callback */ }
});

await execute(async () => {
  await api.saveData(data);
  dispatch(updateState());
});
```

**Centralized Utilities:**
- **toastMessages.ts**: Unified messaging (AUTH, PROFILE, TRIP, IMAGE, GENERIC)
- **errorHandling.ts**: Error extraction and display
- **useNavigation.ts**: Navigation data and state
- **useImageUpload.ts**: Image validation and upload

**State Management Strategy:**
- **Redux Toolkit**: Persisted state (auth token, user, trips)
- **React Hooks**: Operation state (loading, errors)
- **Local State**: UI state (modals, pickers, form focus)

### Shared Layer: Monorepo Domain Types
Core domain models, API contract types, request/response DTOs, and shared enums (e.g., `TripCategory`) are located in a root-level `shared/` folder:
- **Single Source of Truth**: Prevents duplicating interfaces and enum definitions between the client and server codebases.
- **Path Resolution**: Resolved dynamically using TS path mappings (`@shared/*`) in development, and compiled cleanly via `esbuild` for production distributions.

---

## Running Locally

### Backend Setup
```bash
git clone https://github.com/ayush-prataps/nomadly.git
cd nomadly/server
npm install
cp .env.example .env
npm run dev
```

### Client Setup
```bash
cd ../client
npm install
cp .env.example .env
npm run dev
```

### Running Tests
To run backend unit tests:
```bash
cd ../server
npm run test
```

---

## Authentication and Security
- Access token: stored in memory on the client
- Refresh token: httpOnly cookie set by the server
- CSRF: token persisted in localStorage and sent as `x-csrf-token` for refresh/logout
- 401 handling: client automatically attempts refresh; on failure, user is redirected to login
- Google Identity Services: One Tap and button supported; configure Authorized Origin for `http://localhost:5173`

---

## Scripts

### Server
From [server/package.json](server/package.json):
- `npm run dev` — Runs dev server with tsx for TypeScript watch mode
- `npm run build` — Compiles TypeScript to JavaScript
- `npm start` — Runs compiled server from `dist/server.js`
- `npm run test` — Runs the Vitest test suite

### Client
From [client/package.json](client/package.json):
- `npm run dev` — Vite dev server (port 5173)
- `npm run build` — Production build with optimization
- `npm run preview` — Preview production build locally
- `npm run lint` — ESLint with TypeScript support

---
