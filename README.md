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
- 🚧 Multi stop trips with detailed destinations
- 🚧 Location search with map integration
- 🚧 Store coordinates for accurate mapping
- 🚧 Visualize trips using routes and pins

### ✅ Task Management
- 🚧 Create and assign tasks to trip members
- 🚧 Role based task completion
- ⏳ Track deadlines and progress
- ⏳ Filter tasks by status or member

### 💸 Budget and Expenses
- 🚧 Set total trip budget
- 🚧 Add shared and individual expenses
- ⏳ Automatic calculation of spent and remaining budget
- ⏳ Individual member expense tracking
- ⏳ Category based spending summary

### 🏨 Accommodations
- 🚧 Add lodging details with check in and check out dates
- ⏳ Store booking links, costs, and notes
- ⏳ Centralized accommodation reference for the trip

### 🖼️ Memories and Media
- 🚧 Upload trip photos securely
- ⏳ Access control for uploading and deleting media
- ⏳ Download shared memories

### 👥 Members and Collaboration
- 🚧 Invite members via email or username
- ⏳ Accept or reject trip invitations
- 🚧 Role based permissions such as creator, editor, and viewer
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

### Backend
```bash
src/
├── config/
├── controllers/
├── services/
├── routes/
├── middlewares/
├── models/
├── utils/
├── sockets/
├── app.ts
└── server.ts
```

### Client (key folders)
```bash
src/
├── components/
├── pages/
├── store/
├── services/
├── hooks/
├── utils/
└── main.tsx
```

---

## 🧪 Running Locally

### Backend Setup
```bash
git clone https://github.com/your-username/nomadly.git
cd nomadly/server
npm install
```
Create a `.env` file from the example:
```bash
cp .env.example .env
```

Start the server (TypeScript):
```
npx ts-node-dev --respawn src/server.ts
```

### Client Setup
```bash
cd ../client
npm install
cp .env.example .env
npm run dev
```

The client expects `VITE_API_URL` to point to your server (default `http://localhost:4444/api`). The server sets an httpOnly refresh token cookie and the client keeps the access token in memory, using a CSRF token for refresh calls.

### Two-terminal workflow
- Terminal A (server): `cd server && npm run dev:tsx`
- Terminal B (client): `cd client && npm run dev`

Optionally, create a root-level script with `concurrently` to run both at once.

---

## ⚙️ Environment Variables

### Server (.env)
See [server/.env.example](server/.env.example) for a complete list, including:
- `PORT`, `MONGO_URL`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`, optional expiries
- `CLIENT_URL`, `CORS_ORIGIN`
- `CLOUDINARY_*`
- `GOOGLE_CLIENT_ID`

### Client (.env)
See [client/.env.example](client/.env.example):
- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_MAPBOX_TOKEN`

---

## 🔐 Auth & Security (Overview)
- Access token: stored in memory on the client
- Refresh token: httpOnly cookie set by the server
- CSRF: token persisted in localStorage and sent as `x-csrf-token` for refresh/logout
- 401 handling: client automatically attempts refresh; on failure, user is redirected to login
- Google Identity Services: One Tap and button supported; configure Authorized Origin for `http://localhost:5173`

---

## 🔌 Minimal API Endpoints
- `POST /api/auth/login` — username/email + password
- `POST /api/auth/register` — create account
- `POST /api/auth/google` — Google ID token sign-in
- `POST /api/auth/refresh` — refresh access token (requires CSRF header)
- `POST /api/auth/logout` — revoke refresh token
- `GET /api/trips` — list trips (auth)
- `POST /api/trips` — create trip (auth)

---

## 🧰 Scripts

### Server
From [server/package.json](server/package.json):
- `npm run dev` — nodemon (JS entry)
- `npm run dev:tsx` — tsx watch for `src/server.ts`
- `npm run build` — compile TypeScript
- `npm start` — run compiled server (`dist/server.js`)

### Client
From [client/package.json](client/package.json):
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — eslint

---

