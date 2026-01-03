# Nomadly Backend

Express + TypeScript REST API for travel planning platform with real-time WebSocket support.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (Atlas URI)
- Cloudinary account (for image uploads)
- Google OAuth credentials

### Installation
```bash
npm install
cp .env.example .env  # Configure environment variables
npm run dev:tsx       # Start dev server (port 4444)
```

### Build & Production
```bash
npm run build    # Compile TypeScript to JavaScript
npm start        # Run compiled server from dist/server.js
npm run format   # Format code with Prettier
```

---

## 📂 Project Structure

```
src/
├── modules/             # Domain-driven modules (feature-based)
│   ├── auth/           # Authentication (login, register, Google OAuth, JWT)
│   ├── users/          # User profiles and account management
│   ├── trips/          # Trip management with sub-modules
│   │   ├── core/                # Trip CRUD operations
│   │   ├── destinations/        # Multi-stop itinerary
│   │   ├── members/             # Trip member and role management
│   │   ├── tasks/               # Trip tasks and to-do items
│   │   ├── budget/              # Budget and expense tracking
│   │   ├── accommodations/      # Lodging management
│   │   ├── memories/            # Photo uploads and media
│   │   └── chat/                # Real-time trip messaging
│   ├── maps/           # Map and location services
│   └── invitations/    # Member invitation management
├── shared/              # Shared utilities
│   ├── middlewares/     # Global middleware (error handling, CORS)
│   ├── common-types/    # Shared TypeScript interfaces
│   └── utils/           # Helper functions
├── config/              # Configuration files (database, external services)
├── sockets/             # WebSocket handlers for real-time features
├── app.ts               # Express app configuration
└── server.ts            # Server entry point (HTTP + Socket.io)
```

---

## 🛠️ Tech Stack

- **Node.js + Express 5** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB + Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Socket.io** - Real-time WebSocket communication
- **Cloudinary** - Cloud image storage
- **Multer** - File upload handling
- **Google Auth Library** - Google OAuth integration
- **CORS + Cookie Parser** - Security middleware

---

## 🏗️ Architecture Patterns

### Domain-Driven Modular Design
Each module follows a consistent structure for **separation of concerns**:

```
Module/
├── {name}.controller.ts  → HTTP layer (req/res handling)
├── {name}.service.ts     → Business logic & database ops
├── {name}.middleware.ts  → Validation & error handling
├── {name}.routes.ts      → Route definitions
├── {name}.types.ts       → TypeScript interfaces
└── index.ts              → Module barrel export
```

**Flow**: Request → Router → Middleware → Controller → Service → Database

### Authentication & Security
- **Access Token**: JWT stored in memory on client
- **Refresh Token**: httpOnly cookie set by server
- **CSRF Protection**: Token generated per session, verified on sensitive ops
- **Ownership Verification**: Middleware ensures users can only access their resources
- **Password Security**: Bcrypt hashing with salt rounds

### Error Handling
Centralized error codes and messages:
```typescript
// Consistent error responses
{
  statusCode: 400,
  message: "Invalid credentials",
  errorCode: "AUTH_INVALID_CREDENTIALS"
}
```

### Real-Time Features (Socket.io)
WebSocket handlers for:
- Trip chat messaging
- Real-time member updates
- Activity notifications
- Collaborative updates

---

## ⚙️ Environment Variables

Create `.env` file in `server/` directory:

```env
# Server
PORT=4444
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/nomadly
# OR MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/nomadly

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Client
CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# Cloudinary (Image uploads)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## 🔐 Authentication Flow

1. **Signup/Login**: Username + Email + Password → Bcrypt hash → MongoDB
2. **Token Generation**: Access JWT (15m) + Refresh token (7d, httpOnly cookie)
3. **CSRF Protection**: Token generated on login, verified on refresh
4. **Automatic Refresh**: Client refreshes token before expiry
5. **Google OAuth**: ID token exchange → Create/find user → Generate tokens
6. **Logout**: Clear refresh cookie, invalidate tokens

---

## 🧪 Development Guidelines

### Module Organization
Each feature is self-contained:
- **Routes**: Define endpoints
- **Controller**: Parse requests, call service, send responses
- **Service**: Implement business logic, database queries
- **Middleware**: Validation, authentication, authorization
- **Types**: Reusable interfaces for requests/responses

### Naming Conventions
- Controllers: `{entity}.controller.ts` with methods like `createTrip()`
- Services: `{entity}.service.ts` as class with static methods
- Routes: `{entity}.routes.ts` with exported router
- Types: `{entity}.types.ts` with interfaces and types
- Models: `{entity}.model.ts` in modules (Mongoose schemas)

### Best Practices
- Always validate input in middleware before controller
- Use async/await; handle errors gracefully
- Leverage middleware for ownership/permission checks
- Return consistent error responses
- Document API endpoint behavior
- Keep controllers thin; put logic in services

---

## 🚨 Common Issues

- **MongoDB Connection Failed**: Verify `MONGO_URI` is correct and MongoDB is running
- **JWT Token Expired**: Frontend should handle 401 and refresh automatically
- **CORS Errors**: Ensure `CLIENT_URL` in `.env` matches frontend URL exactly
- **Cloudinary Upload Fails**: Verify credentials and image size limits
- **Socket.io Connection Refused**: Check `CLIENT_URL` and CORS settings match

---

## 📦 Key Dependencies

### Core
- `express` - Web framework
- `typescript` - Type safety
- `mongoose` - MongoDB ODM
- `socket.io` - WebSocket server

### Security
- `jsonwebtoken` - JWT tokens
- `bcrypt` - Password hashing
- `cors` - CORS middleware
- `cookie-parser` - Cookie handling

### File Handling
- `multer` - File upload middleware
- `cloudinary` - Cloud storage
- `multer-storage-cloudinary` - Multer Cloudinary integration

### Utilities
- `google-auth-library` - Google OAuth verification
- `slugify` - URL-safe strings
- `axios` - HTTP requests

---

## 🔌 Core API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Users
- `GET /api/users/me`
- `PATCH /api/users/me`
- `PATCH /api/users/me/username`
- `PATCH /api/users/me/password`
- `POST /api/users/me/avatar`
- `DELETE /api/users/me/avatar`

### Trips
- `GET /api/trips`
- `POST /api/trips`
- `GET /api/trips/:tripId`
- `PATCH /api/trips/:tripId`
- `DELETE /api/trips/:tripId`

For complete API list, see [main README](../README.md#-core-api-endpoints)

---

## 🧰 Scripts

From `server/package.json`:

- `npm run dev` — Runs with nodemon (watches JS files)
- `npm run dev:tsx` — **Recommended** - Runs with tsx for TypeScript watch mode
- `npm run build` — Compiles TypeScript to JavaScript (`dist/` folder)
- `npm start` — Runs compiled server from `dist/server.js`
- `npm run format` — Format code with Prettier

---

## 🔗 Related Documentation

- Main project README: `../README.md`
- Frontend documentation: `../client/README.md`
- API endpoints: See main README for complete list

---

## 📝 Notes

- Server uses ES modules (`"type": "module"` in package.json)
- TypeScript strict mode enabled
- MongoDB uses Mongoose for schema validation
- Cloudinary folder structure: `nomadly/[feature]/`
- Socket.io namespaces for isolated real-time features
- Middleware execution order matters (placed strategically in `app.ts`)
