# Users Module

User profile management and account operations. Handles profile updates, avatar uploads, and user profile visibility.

---

## User Document Schema

```typescript
{
  username: string          // Required, unique
  email: string            // Unique, sparse index
  passwordHash: string     // Bcrypt hashed password
  name: string            // Display name
  bio: string             // User biography (max 300 chars)
  profilePicUrl: string   // Cloudinary image URL
  profilePicPublicId: string  // Cloudinary public ID for deletion
  isPublic: boolean       // Profile visibility (default: false)
  isAdmin: boolean        // Admin flag
  roles: string[]         // User roles (default: ["user"])
  googleId: string        // OAuth identifier
  refreshTokenHash: string // Hashed refresh token for revocation
  stats: {
    tripsCount: number    // Number of trips created
    likesCount: number    // Engagement metric
    followersCount: number // User followers
  }
  createdAt: Date
  updatedAt: Date
}
```

### Indexes

```
- username: unique
- email: unique sparse
```

### Virtual Fields

- `_plainPassword`: Temporary field for password hashing (not persisted)

---

## Key Features

### Password Management

- **Pre-save Hook**: Automatically hashes plain passwords using bcrypt
- **Compare Method**: `comparePassword(password: string)` - Bcrypt comparison
- **Hashing**: 10 salt rounds for security

### Profile Management

- **Bio**: Optional biography (max 300 chars)
- **Profile Picture**: Stored via Cloudinary
- **Visibility**: `isPublic` flag controls profile discoverability
- **Display Name**: Optional name different from username

### Statistics

Track user engagement:
- `tripsCount` - Number of trips created
- `likesCount` - Engagement metrics
- `followersCount` - Social metrics

---

## HTTP Endpoints

**Protected Routes**:
- `GET /api/users/:userId` - Get user profile
- `PATCH /api/users/:userId` - Update user profile
- `POST /api/users/:userId/avatar` - Upload profile picture
- `DELETE /api/users/:userId/avatar` - Delete profile picture
- `GET /api/users/:userId/trips` - Get user's public trips

**Public Routes** (if isPublic=true):
- `GET /api/users/:userId/profile` - View public profile

---

## UserService Methods

### Profile Operations

```typescript
getUserById(userId: string): Promise<UserProfile>
// Fetch user by ID with profile fields

updateProfile(userId: string, data: Partial<User>): Promise<UserProfile>
// Update profile fields (name, bio, isPublic, etc.)
// Validates input and updates timestamps

uploadAvatar(userId: string, file: MulterFile): Promise<{ url: string, publicId: string }>
// Upload profile picture to Cloudinary
// Deletes old picture if exists
// Returns new URL and public ID

deleteAvatar(userId: string): Promise<void>
// Remove profile picture from Cloudinary
// Clears profilePicUrl and profilePicPublicId

getPublicProfile(userId: string): Promise<PublicProfile>
// Get public profile data (respects isPublic flag)

incrementTripCount(userId: string): Promise<void>
// Update stats after trip creation
```

---

## Upload Configuration

**Avatar Upload** (`uploadProfile` middleware):
- **Folder**: `nomadly/profiles`
- **Formats**: jpg, jpeg, png, webp
- **Transform**: 500x500 (fill crop)
- **Limits**: Single file, enforced by multer

---

## Permissions

- **Own Profile**: Users can update their own profile
- **Public Profiles**: Anyone can view if `isPublic=true`
- **Private Profiles**: Only owner can view (default)
- **Admin Operations**: Admins can modify roles and flags

---

## ProfileDTO

```typescript
{
  id: ObjectId
  username: string
  name?: string
  bio?: string
  profilePicUrl?: string
  isPublic: boolean
  stats: {
    tripsCount: number
    likesCount: number
    followersCount: number
  }
  createdAt: Date
  updatedAt: Date
}
```

---

## Integration Points

**Called by**:
- Auth module after registration/login
- Trip module when managing members
- Invitations when resolving user references

**Calls**:
- Cloudinary utils for avatar upload/deletion
- Trip model for trip count updates

---

## Examples

### Get User Profile

```typescript
GET /api/users/507f1f77bcf86cd799439011
Authorization: Bearer eyJhbGc...

// Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "name": "John Doe",
      "bio": "Travel enthusiast",
      "profilePicUrl": "https://...",
      "isPublic": true,
      "stats": {
        "tripsCount": 5,
        "likesCount": 12,
        "followersCount": 8
      }
    }
  }
}
```

### Update Profile

```typescript
PATCH /api/users/507f1f77bcf86cd799439011
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "name": "John D",
  "bio": "Adventure seeker and photographer",
  "isPublic": true
}
```

### Upload Avatar

```typescript
POST /api/users/507f1f77bcf86cd799439011/avatar
Authorization: Bearer eyJhbGc...
Content-Type: multipart/form-data

[image file]
```

---

## Error Handling

| Scenario | Status | Response |
|----------|--------|----------|
| User not found | 404 | "User not found" |
| Unauthorized update | 403 | "Cannot update other user's profile" |
| Invalid file type | 400 | "Invalid file format" |
| File too large | 413 | "File size exceeds limit" |
| Bio exceeds 300 chars | 400 | "Bio must be max 300 characters" |

