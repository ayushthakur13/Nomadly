# 🌍 Nomadly

> Project status: In Progress (actively developed). Many features are implemented; others are planned or partially available. See checklists below.

Nomadly is a modern full stack SaaS platform designed to simplify group travel planning. It brings trip organization, collaboration, budgeting, media sharing, and social discovery into a single unified experience. Built with scalability and real world use cases in mind, Nomadly evolves from a trip planner into a travel focused social network with AI powered planning capabilities.

---

## ✨ Why Nomadly

Group travel planning is often chaotic. People rely on WhatsApp, spreadsheets, notes, and multiple booking apps, which leads to confusion, duplicated effort, and poor coordination.

Nomadly solves this by:
- Centralizing all trip related information in one platform
- Enabling real time collaboration for groups
- Making travel plans structured, visual, and reusable
- Preparing the foundation for AI powered itinerary generation and social discovery

---

## 🧩 Core Features

Implemented vs Planned (✅ implemented · 🚧 in progress · ⏳ planned)

### 🧳 Trip Management
- ✅ Create, update, and delete trips
- ✅ Add source and final destination
- ✅ Track trip status as upcoming, ongoing, or completed
- ✅ Upload and manage trip cover images
- ✅ Toggle trip visibility between public and private

### 📍 Destinations and Itineraries
- ✅ Multi stop trips with detailed destinations
- ✅ Location search with map integration
- ✅ Store coordinates for accurate mapping
- ✅ Visualize trips using routes and pins

### ✅ Task Management
- ✅ Create and assign tasks to trip members
- ✅ Role based task completion
- ✅ Track deadlines and progress
- ✅ Filter tasks by status or member

### 💸 Budget and Expenses
- ✅ Create budget with trip members and planned contributions
- ✅ Add shared expenses with flexible split methods (equal, custom, percentage)
- ✅ Automatic calculation of spent and remaining budget
- ✅ Individual member expense tracking with per-member summaries
- ✅ Category-based expense organization
- ✅ Clone trip with budget (three modes: TEMPLATE, PLANNING, FULL_HISTORY)
- ✅ Trip cache synchronization for budget consistency

### 🏨 Accommodations
- ✅ Add lodging details with check in and check out dates
- ✅ Store booking links, costs, and notes
- ✅ Centralized accommodation reference for the trip

### 🖼️ Memories and Media
- ✅ Upload trip photos securely
- ✅ Access control for uploading and deleting media
- ✅ Download shared memories

### 👥 Members and Collaboration
- ✅ Invite members via email or username
- ✅ Accept or reject trip invitations
- ✅ Role based permissions such as creator and member
- ⏳ Real time group chat using WebSockets

---

## 🌐 Social Layer (In Progress)

- 🚧 Explore public and featured trips
- ⏳ Clone trips to reuse itineraries
- ⏳ Like, save, and share trips
- ⏳ Public user profiles with trip statistics
- ⏳ Discovery focused feed inspired by social platforms

---

## 🤖 AI Features (Planned)

- ⏳ AI powered itinerary generation based on destination, budget, duration, and interests
- ⏳ Smart day wise planning with hidden gems and local experiences
- ⏳ AI generated budget breakdown
- ⏳ Save AI generated trips as editable drafts
- ⏳ Coming soon access for free users with premium upgrades

---

## 👥 Shared and Community Trips (Planned)

- ⏳ Open trips for shared joining
- ⏳ Verified traveler profiles
- ⏳ Safety features such as SOS links to local services
- ⏳ Community and organization managed trips
- ⏳ Admin dashboards for large group coordination

---

## 🏗️ Tech Stack

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
- JWT based authentication
- Google OAuth
- Socket.io for real time features
- Multer and Cloudinary for media uploads

### Development and Infrastructure
- Strict TypeScript configuration
- RESTful API architecture
- Modular and scalable project structure
- Environment based configuration
- Ready for CI CD and production deployment

---

## 📂 Project Structure

### Server
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
├── ui/                   # Reusable UI components organized by domain
│   ├── auth/             # Google login, protected routes
│   ├── common/           # Shared components (navbar, sidebar, modals, footer)
│   ├── icon/             # Icon registry and component
│   ├── landing/          # Landing page sections
│   ├── layout/           # Main layout wrapper
│   ├── profile/          # User profile components
│   └── trips/            # Trip-related UI components
├── constants/            # Centralized constants (toastMessages, etc.)
├── features/             # Feature-specific modules with domain logic
│   ├── auth/             # Authentication flows, routes, and state
│   ├── dashboard/        # Main dashboard page
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
├── pages/                # Page-level components (routing destinations)
├── services/             # API clients and external integrations
├── store/                # Redux Toolkit root store configuration
├── styles/               # Global styles and animations
├── utils/                # Utility functions (errorHandling, auth, debounce)
└── main.tsx              # React app entry point
```

---

## 📚 Documentation

For detailed documentation on architecture, features, and implementation details:

- **[Backend Documentation](docs/BACKEND_DOCUMENTATION.md)** — Comprehensive backend guide covering modules, API design, security, database, and deployment
- **[Frontend Documentation](docs/FRONTEND_DOCUMENTATION.md)** — Complete frontend guide covering React architecture, state management, services, hooks, and styling

---

## 🏛️ Architecture & Patterns

### Backend: Domain-Driven Modular Design
Each module (auth, users, trips, etc.) follows a consistent pattern:

```typescript
// Module structure example: modules/auth/
auth/
├── auth.controller.ts  // Handle HTTP requests/responses
├── auth.service.ts     // Business logic and database operations
├── auth.middleware.ts  // Request validation and error handling
├── auth.routes.ts      // Route definitions
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

---

## 🧪 Running Locally

### Backend Setup
```bash
git clone https://github.com/ayushthakur13/nomadly.git
cd nomadly/server
npm install
```
Create a `.env` file from the example:
```bash
cp .env.example .env
```

Start the server (TypeScript):
```bash
npm run dev
```

### Client Setup
```bash
cd ../client
npm install
cp .env.example .env
npm run dev
```

**Dependencies installed:**
- React 18 + TypeScript
- Tailwind CSS for styling
- Redux Toolkit for state management
- React Hook Form for form handling
- Axios for HTTP requests
- react-hot-toast for notifications
- Mapbox GL for map visualization
- Vite as build tool

The client expects `VITE_API_URL` to point to your server (default `http://localhost:4444/api`). The server sets an httpOnly refresh token cookie and the client keeps the access token in memory, using a CSRF token for refresh calls.

**Build optimization:** Uses Vite for fast development and optimized production builds with automatic code splitting.

### Two-terminal workflow
- Terminal A (server): `cd server && npm run dev`
- Terminal B (client): `cd client && npm run dev`

Optionally, create a root-level script with `concurrently` to run both at once.

---

## 🔐 Auth & Security (Overview)
- Access token: stored in memory on the client
- Refresh token: httpOnly cookie set by the server
- CSRF: token persisted in localStorage and sent as `x-csrf-token` for refresh/logout
- 401 handling: client automatically attempts refresh; on failure, user is redirected to login
- Google Identity Services: One Tap and button supported; configure Authorized Origin for `http://localhost:5173`

---

## 🧰 Scripts

### Server
From [server/package.json](server/package.json):
- `npm run dev` — Runs with tsx for TypeScript watch mode
- `npm run build` — Compiles TypeScript to JavaScript
- `npm start` — Runs compiled server from `dist/server.js`

### Client
From [client/package.json](client/package.json):
- `npm run dev` — Vite dev server (port 5173)
- `npm run build` — Production build with optimization
- `npm run preview` — Preview production build locally
- `npm run lint` — ESLint with TypeScript support

---
