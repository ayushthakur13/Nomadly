# Nomadly Backend Documentation

High-level backend architecture overview. For detailed module documentation, see the module-specific READMEs.

## Quick Links

- **[Trips Module](server/src/modules/trips/README.md)** - Trip management, destinations, members, tasks, accommodations, chat, memories
  - **[Budget Sub-Module](server/src/modules/trips/budget/README.md)** - Expense tracking, splits, budgeting
- **[Auth Module](server/src/modules/auth/README.md)** - Registration, login, JWT tokens, CSRF protection
- **[Users Module](server/src/modules/users/README.md)** - Profile management, avatars, statistics
- **[Invitations Module](server/src/modules/invitations/README.md)** - Trip invitations, email-based onboarding
- **[Maps Module](server/src/modules/maps/README.md)** - Location search with Mapbox/OpenStreetMap

---

## Tech Stack

- **Runtime**: Node.js (TypeScript)
- **Framework**: Express 5.1.0
- **Database**: MongoDB 8.16.0 with Mongoose ODM
- **Real-time**: Socket.IO 4.8.1
- **Authentication**: JWT + Bcrypt
- **Image Storage**: Cloudinary
- **Geolocation**: Mapbox API (fallback: OpenStreetMap)

---

## Development Commands

```bash
npm run dev      # Run development server with hot-reload
npm run build    # Compile TypeScript to JavaScript
npm start        # Run compiled JavaScript
npm run format   # Format code with Prettier
```

---

## Architecture Overview

### Server Structure

```
server/src/
├── app.ts                 # Express app configuration
├── server.ts              # HTTP server + Socket.IO
├── config/                # Configuration files
├── modules/               # Feature modules
│   ├── auth/             # Authentication
│   ├── users/            # User profiles
│   ├── trips/            # Trip management + sub-modules
│   ├── invitations/      # Trip invitations
│   └── maps/             # Location search
├── shared/                # Utilities and middlewares
└── sockets/               # WebSocket handlers
```

### Port & Environment

- **Default Port**: 4444 (configurable via `PORT` env var)
- **MongoDB**: Configured via `MONGO_URI` env var
- **Client URL**: For CORS, defaults to `http://localhost:5173`

---

## Core Infrastructure

### app.ts - Express Configuration

**Middleware Stack**:
1. Trust proxy for load balancers
2. URL-encoded and JSON body parsing
3. Cookie parsing
4. CORS with credentials
5. Static file serving
6. Global error handling

**API Health Check**: `GET /` - Returns `{ message: "Nomadly API is alive" }`

**Route Registration**:
```
/api/auth                        - Authentication
/api/users                       - User management
/api/trips                       - Trip CRUD
/api/trips/:tripId/destinations - Destinations
/api/destinations                - Destination items
/api/trips/:tripId/members       - Trip members
/api/trips/:tripId/tasks         - Trip tasks
/api/trips/:tripId/budget        - Trip budget
/api/trips/:tripId/expenses      - Expenses
/api/invitations                 - Invitations
```

### server.ts - Initialization

- HTTP server creation with Express app
- Socket.IO setup with CORS
- MongoDB connection
- Graceful shutdown on SIGINT

---

## Module Overview

| Module | Purpose | Documentation |
|--------|---------|---------------|
| **Auth** | Registration, login, JWT, OAuth, CSRF | [Read](server/src/modules/auth/README.md) |
| **Users** | Profile management, avatars | [Read](server/src/modules/users/README.md) |
| **Trips** | Trip management, destinations, members, tasks, budget, chat, memories | [Read](server/src/modules/trips/README.md) |
| **Budget** | Expenses, splits, budget planning | [Read](server/src/modules/trips/budget/README.md) |
| **Invitations** | Trip member invitations, email-based onboarding | [Read](server/src/modules/invitations/README.md) |
| **Maps** | Location search, geocoding | [Read](server/src/modules/maps/README.md) |

---

## Shared Utilities

### Authentication Middleware

**File**: `shared/middlewares/auth.middleware.ts`

Protects routes requiring authentication:
1. Extract Bearer token from Authorization header
2. Verify JWT signature and expiration
3. Populate `req.user` on success
4. Return 401 on failure

**Attached to req.user**: `{ id, username, email, isAdmin }`

### File Upload Middleware

**File**: `shared/middlewares/multer.ts`

Cloudinary storage presets:
- **uploadProfile** - User avatars (500x500, folder: `nomadly/profiles`)
- **uploadTripCover** - Trip covers (1200x600, folder: `nomadly/trip_covers`)
- **uploadDestination** - Destination images (folder: `nomadly/destinations`)
- **uploadMemory** - Trip photos/videos (folder: `nomadly/memories`)

### Async Error Handler

**File**: `shared/utils/asyncHandler.ts`

Wraps async route handlers to catch errors and delegate to Express error middleware.

---

## Cloudinary Configuration

**File**: `config/cloudinary.config.ts`

Requires environment variables:
```
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

---

## Real-Time Features (Socket.IO)

**Server Configuration** (in `server.ts`):
- CORS enabled for client URL
- Credentials support for authenticated requests

**Events**:
- `joinRoom` - Connect to trip's message channel
- `sendMessage` - Send message to trip
- `receiveMessage` - Broadcast to room
- `disconnect` - On client disconnect

---

## Security Features

1. **Password Security**: Bcrypt hashing (10 salt rounds)
2. **Token Security**: JWT access (short-lived) + refresh tokens (long-lived)
3. **CSRF Protection**: Token generation, cookie comparison on sensitive ops
4. **Data Privacy**: Private trips, permission checks, soft deletes
5. **Input Validation**: Email format, date validation, bounds checking
6. **CORS**: Restricted to CLIENT_URL, credentials enabled

---

## Response Format Standard

**Success (2xx)**:
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... }
}
```

**Error (4xx, 5xx)**:
```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

---

## Database Indexes Summary

**Performance indexes** organized by collection:

- **Users**: username (unique), email (unique sparse)
- **Trips**: createdAt, startDate, destinationLocation.name, lifecycleStatus, isPublic, engagement.views, createdBy, slug (unique)
- **Destinations**: tripId, tripId+order
- **Tasks**: tripId, isArchived
- **Expenses**: tripId+date
- **Accommodations**: tripId
- **Memories**: tripId, tripId+createdAt
- **Messages**: trip+createdAt
- **Invitations**: tripId+status, invitedUserId+status, invitedEmail+status, token+status, expiresAt

---

## Environment Variables

```
PORT=4444
MONGO_URI=mongodb+srv://...
CLIENT_URL=https://nomadly.app
NODE_ENV=production

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

MAPBOX_ACCESS_TOKEN=...

JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## Error Handling Strategy

| Error Type | Status | Example |
|-----------|--------|---------|
| Validation | 400 | Missing required field |
| Authentication | 401 | Invalid token |
| Authorization | 403 | Permission denied |
| Not Found | 404 | Trip not found |
| Conflict | 409 | Duplicate username |
| Server Error | 500 | Unexpected exception |

Error middleware in `app.ts` handles:
- Mongoose validation errors → 400
- Duplicate key errors (11000) → 409
- JWT errors → 401
- 404 for undefined routes
- Global error catch-all

---

## Deployment Considerations

1. **Database**: MongoDB Atlas connection string
2. **Environment**: Set via hosting platform env vars
3. **External Services**: Cloudinary, Mapbox, Google OAuth credentials
4. **Security**: Generate strong JWT secrets (min 32 chars)
5. **CORS**: Update CLIENT_URL to production domain
6. **Monitoring**: Add error tracking (Sentry) and logging (Winston)
7. **Rate Limiting**: Implement express-rate-limit
8. **Health Checks**: Use GET / endpoint for uptime monitoring

---

## Future Enhancements

- **Performance**: Redis caching layer, query optimization
- **Features**: Notifications, advanced expense settlement, collaborative voting
- **Security**: Rate limiting, 2FA, API keys for integrations
- **Observability**: Structured logging, request tracing, performance monitoring
- **Testing**: Unit tests (Jest), integration tests, E2E tests

---

## Summary

Nomadly's backend is a modular Node.js/Express/MongoDB application designed for collaborative trip planning. Key strengths:

- ✅ Modular architecture with clear separation of concerns
- ✅ Comprehensive trip management with nested resources
- ✅ Real-time collaboration via Socket.IO
- ✅ Secure authentication with JWT + CSRF protection
- ✅ Media management via Cloudinary
- ✅ Location services via Mapbox + OpenStreetMap
- ✅ Production-ready error handling and validation
- ✅ Indexed MongoDB for performance

For detailed information, see module-specific documentation linked above.
