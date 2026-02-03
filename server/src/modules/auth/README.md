# Auth Module

User registration, login, logout, and token management. Handles JWT authentication, OAuth integration, and session management.

---

## Key Features

### Registration

`POST /api/auth/register`

Creates new user with username, email, password, and optional name.

**Validation**:
- Non-empty strings required
- Email format validation
- Unique username and email

**Response**:
- Access token and refresh token
- CSRF token
- User profile (id, username, email, name)

### Login

`POST /api/auth/login`

Authenticates using usernameOrEmail and password.

**Process**:
1. Find user by username or email
2. Compare bcrypt-hashed passwords
3. Issue access token (short-lived, ~15min)
4. Issue refresh token (long-lived, ~7days)
5. Store refresh token hash in user document
6. Return tokens and CSRF token

**Response**: Tokens + user profile

### Logout

`POST /api/auth/logout` [Protected]

Clears session and tokens.

**Process**:
1. Requires CSRF validation
2. Clears refresh token cookie
3. Clears CSRF cookie
4. Invalidates session on server

### Me Endpoint

`GET /api/auth/me` [Protected]

Returns current authenticated user profile.

**Fields**: id, username, name, email, profilePicUrl, isAdmin, isPublic, timestamps

### Google OAuth

`POST /api/auth/google`

Integrates Google authentication using google-auth-library.

**Process**:
1. Verify Google token
2. Create or update user on successful verification
3. Issue access and refresh tokens

### Token Refresh

`POST /api/auth/refresh`

Exchanges refresh token for new access token.

**Process**:
1. Requires CSRF validation
2. Validates refresh token exists and hasn't expired
3. Compares against stored hash
4. Issues new access token
5. Returns new tokens

---

## Security Features

### Password Security

- **Hashing**: bcrypt with 10 salt rounds
- **Comparison**: bcrypt.compare() for authentication
- **Storage**: Never stored in plain text
- **Pre-hook**: Automatic hashing on user save

### JWT Tokens

- **Access Token**: Short-lived (~15 minutes)
  - Payload: `{ sub: userId, username, email, isAdmin }`
- **Refresh Token**: Long-lived (~7 days)
  - Stored as cookie (HTTP-only)
  - Hash stored in user document for revocation

### CSRF Protection

- **Token Generation**: 32-byte hex tokens
- **Storage**: HTTP-only cookie + request header comparison
- **Validation**: Required on sensitive operations (logout, refresh)
- **Cookie Flags**: httpOnly, secure (production), sameSite

### Cookie Configuration

```typescript
{
  httpOnly: true              // Prevents JavaScript access
  secure: true                // HTTPS only (production)
  sameSite: 'strict'         // CSRF protection
  maxAge: 7 * 24 * 60 * 60   // 7 days
}
```

---

## Auth Middleware

**File**: `shared/middlewares/auth.middleware.ts`

Protects routes requiring authentication.

**Flow**:
1. Extract Bearer token from `Authorization` header
2. Verify JWT signature
3. Check token expiration
4. Populate `req.user` on success
5. Return 401 on failure

**Attached to req.user**:
```typescript
{
  id: string          // User ID (sub claim)
  username: string    // Username
  email: string       // Email
  isAdmin: boolean    // Admin flag
}
```

**Error Messages**:
- "Missing authorization token" - No header provided
- "Token expired" - JWT expired
- "Invalid token" - JWT signature invalid
- "Authentication failed" - Other JWT errors

---

## Controllers & Routes

### auth.controller.ts

Routes and HTTP request handling for:
- Registration
- Login
- Logout
- Me endpoint
- Google OAuth
- Token refresh

### auth.routes.ts

Defines routes with appropriate middleware:

```
POST   /api/auth/register               - Public
POST   /api/auth/login                  - Public
POST   /api/auth/logout                 - Protected + CSRF
GET    /api/auth/me                     - Protected
POST   /api/auth/google                 - Public
POST   /api/auth/refresh                - Protected + CSRF
```

---

## Token Configuration

Set via environment variables:

```
JWT_ACCESS_SECRET=your-secret-key      # Access token signing key
JWT_REFRESH_SECRET=your-refresh-secret  # Refresh token signing key
JWT_ACCESS_EXPIRES=15m                  # Access token TTL
JWT_REFRESH_EXPIRES=7d                  # Refresh token TTL
```

---

## Error Handling

| Scenario | Status | Response |
|----------|--------|----------|
| Invalid username/email | 401 | "Invalid credentials" |
| Wrong password | 401 | "Invalid credentials" |
| Username already exists | 409 | "Username already taken" |
| Email already exists | 409 | "Email already registered" |
| Token expired | 401 | "Token expired" |
| Invalid CSRF token | 403 | "CSRF validation failed" |
| Missing token | 401 | "Missing authorization token" |

---

## Integration Points

**Called by**:
- Client applications during authentication flow
- Protected routes via auth middleware

**Uses**:
- User model for password hashing/verification
- JWT utilities for token signing/verification
- Google Auth Library for OAuth
- Cloudinary for profile pictures (in User module)

---

## Response Format

**Login/Register Success (2xx)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "csrfToken": "abc123...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "name": "John Doe"
    }
  }
}
```

**Error (4xx, 5xx)**:
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

## Examples

### Register

```typescript
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

### Login

```typescript
POST /api/auth/login
Content-Type: application/json

{
  "usernameOrEmail": "johndoe",
  "password": "securePassword123"
}
```

### Me Endpoint

```typescript
GET /api/auth/me
Authorization: Bearer eyJhbGc...

// Returns current user profile
```

### Refresh Token

```typescript
POST /api/auth/refresh
Authorization: Bearer eyJhbGc...
X-CSRF-Token: abc123...
```

