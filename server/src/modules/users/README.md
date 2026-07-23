# Users Module

User profile management, security credentials, and public traveler blueprint discovery. Handles profile updates, avatar uploads/deletions, username/password/email changes, Google OAuth provider status, and public traveler profiles.

---

## User Document Schema

```typescript
{
  username: string           // Required, unique (3-20 chars, letters/numbers/underscore)
  email?: string | null      // Unique, sparse index
  passwordHash?: string | null // Bcrypt hashed password (null for OAuth-only users)
  name?: string              // Display name
  bio?: string               // Traveler biography (max 300 chars)
  profilePicUrl?: string | null     // Cloudinary image URL
  profilePicPublicId?: string | null// Cloudinary public ID for deletion
  isPublic: boolean          // Profile visibility (default: false)
  isAdmin?: boolean          // Admin flag (default: false)
  roles: string[]            // User roles (default: ["user"])
  googleId?: string | null   // Google OAuth provider ID
  refreshTokenHash?: string | null // Hashed refresh token
  stats?: {
    tripsCount: number       // Number of trips created
    likesCount: number       // Engagement metric
    followersCount: number   // User followers metric
  }
  createdAt: Date
  updatedAt: Date
}
```

### Indexes

```
- username: unique index
- email: unique sparse index
```

---

## HTTP Endpoints

### Public Routes
- `GET /api/users/public/:username` — View a user's public profile and published public trip blueprints.

### Protected Routes (Requires Bearer Auth)
- `GET /api/users/me` — Fetch current user's profile and credential metadata (`hasPassword`, `googleId`).
- `PATCH /api/users/me` — Update profile identity fields (`name`, `bio`, `isPublic`). Note: Toggling `isPublic` from `true` to `false` automatically unpublishes the user's public trip templates (`Trip.updateMany(...)`).
- `POST /api/users/me/avatar` — Upload or replace profile avatar picture (Cloudinary).
- `DELETE /api/users/me/avatar` — Remove profile avatar picture.
- `PATCH /api/users/me/username` — Update account username (requires unique 3-20 character username).
- `PATCH /api/users/me/password` — Change password (requires `currentPassword` verification for existing password accounts).
- `PATCH /api/users/me/email` — Update primary email address. (Requires `currentPassword` for password accounts; restricted for Google OAuth-only accounts).

---

## UserService Methods

```typescript
getUserById(userId: string): Promise<IUser | null>
// Fetch user document by Mongoose ObjectId string

getUserByUsername(username: string): Promise<IUser | null>
// Fetch user document by username

updateUserProfile(userId: string, data: { name?: string; bio?: string; isPublic?: boolean }): Promise<IUser>
// Update profile fields. When switching isPublic to false, unpublishes all user's public trips

updateUserAvatar(userId: string, file: Express.Multer.File): Promise<IUser>
// Upload new avatar to Cloudinary, deleting old image if present

deleteUserAvatar(userId: string): Promise<IUser>
// Remove avatar from Cloudinary and clear profilePicUrl

changeUserUsername(userId: string, newUsername: string): Promise<IUser>
// Validate format and update username (checks uniqueness)

changeUserPassword(userId: string, payload: { currentPassword?: string; newPassword: string }): Promise<IUser>
// Change user password after verifying currentPassword if set

updateUserEmail(userId: string, payload: { newEmail: string; currentPassword?: string }): Promise<IUser>
// Update primary email address. Verifies currentPassword for password accounts.
// Restricts direct email edits for Google OAuth-only users.
```

---

## Serializer & DTO Specs

### Private Serializer (`publicUser`)
Returned for authenticated user endpoints (`/users/me`, update operations):
```typescript
{
  id: string
  _id: string
  username: string
  name?: string
  email?: string
  bio?: string
  profilePicUrl?: string
  isAdmin: boolean
  isPublic: boolean
  googleId: string | null
  hasPassword: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Public Profile Serializer (`publicProfileUser`)
Allow-listed fields returned for public profile discovery (`GET /users/public/:username`):
```typescript
{
  id: string
  username: string
  name?: string
  bio?: string
  profilePicUrl?: string
  isPublic: boolean
  publicTripCount: number
  createdAt: Date
}
```

---

## Error Handling

| Scenario | Code | Status | Message / Reason |
|---|---|---|---|
| User not found | `USER_NOT_FOUND` | 404 | `"User not found"` |
| Username taken | `USERNAME_TAKEN` | 409 | `"Username already taken"` |
| Email taken | `EMAIL_TAKEN` | 409 | `"Email address is already registered"` |
| Incorrect password | `WRONG_CURRENT_PASSWORD` | 400 | `"Incorrect current password"` |
| Invalid password length | `INVALID_PASSWORD` | 400 | `"Password must be at least 6 characters"` |
| OAuth email update attempt | `INVALID_INPUT` | 400 | `"Email changes are managed by your Google OAuth provider"` |
