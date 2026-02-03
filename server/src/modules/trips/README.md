# Trips Module

Comprehensive trip management with multi-level resource organization. Handles core trip operations, nested destinations, task management, budget/expense tracking, accommodations, chat, and media galleries.

## Submodules

1. **Core** (`core/`) - Trip CRUD and lifecycle management
2. **Destinations** (`destinations/`) - Multi-stop itineraries and waypoints
3. **Members** (`members/`) - Collaboration and role-based access
4. **Tasks** (`tasks/`) - Collaborative todo lists
5. **Budget** (`budget/`) - Financial ledger, expenses, and splits
6. **Accommodations** (`accommodations/`) - Lodging information
7. **Chat** (`chat/`) - Real-time messaging
8. **Memories** (`memories/`) - Photo and media gallery

---

## Core Module

### Trip Document Schema

```typescript
{
  tripName: string              // Required, max 100 chars, indexed
  slug: string                  // URL-friendly identifier, unique
  description: string           // Trip details (max 2000 chars)
  startDate: Date              // Required
  endDate: Date                // Required, must be >= startDate
  sourceLocation: ILocation    // Origin location (optional)
  destinationLocation: ILocation // Main destination (required)
  coverImageUrl: string        // Cloudinary image URL
  coverImagePublicId: string   // For deletion
  category: TripCategory       // Trip type (shared enum)
  tags: string[]              // Search/discovery tags
  isPublic: boolean           // Visibility flag (default: false)
  isFeatured: boolean         // Admin-featured trips (default: false)
  lifecycleStatus: TripLifecycleStatus  // DRAFT, PLANNING, IN_PROGRESS, COMPLETED
  createdBy: ObjectId         // Trip creator (indexed)
  members: ITripMember[]      // Array with role ('creator' or 'member')
  destinations: ObjectId[]    // References to Destination documents
  tasksCount: number         // Denormalized count
  membersCount: number       // Denormalized count
  engagement: IEngagement    // Metrics (likes, saves, shares, views, clones)
  budgetSummary: {
    total: number           // Total budget
    spent: number          // Amount spent
  }
  createdAt: Date
  updatedAt: Date
}

// Location Schema (embedded)
{
  name: string              // Location name (required)
  address: string          // Street address
  placeId: string         // Mapbox place ID
  point: {
    type: 'Point'        // GeoJSON Point (for geospatial queries)
    coordinates: [lng, lat]
  }
}

// Trip Member Schema (embedded)
{
  userId: ObjectId        // User reference
  role: 'creator' | 'member'
  joinedAt: Date
  invitedBy: ObjectId    // Who invited them
}

// Engagement Schema (embedded)
{
  likes: number         // Like count
  saves: number        // Save count
  shares: number      // Share count
  views: number       // View count
  clones: number      // Clone count
}
```

### Indexes

```
- createdAt: -1 (for reverse chronological)
- startDate: 1 (for sorting by date)
- destinationLocation.name: 1 (for destination search)
- lifecycleStatus: 1
- isPublic: 1
- engagement.views: -1
- createdBy: 1
- slug: unique
```

### Trip Lifecycle Statuses

- `DRAFT` - Trip being planned
- `PLANNING` - Team is organizing
- `IN_PROGRESS` - Currently traveling
- `COMPLETED` - Trip finished

### Key Endpoints

**Public**:
- `GET /api/trips/public` - Browse public trips (paginated, filterable)
- `GET /api/trips/search-location` - Search locations for trip creation

**Protected**:
- `GET /api/trips` - Get user's trips
- `POST /api/trips` - Create new trip
- `GET /api/trips/:tripId` - Get trip details
- `PUT /api/trips/:tripId` - Update trip
- `DELETE /api/trips/:tripId` - Delete trip with all nested data
- `POST /api/trips/:tripId/cover` - Upload cover image
- `DELETE /api/trips/:tripId/cover` - Delete cover image
- `PATCH /api/trips/:tripId/publish` - Transition to public
- `PATCH /api/trips/:tripId/unpublish` - Transition to private
- `POST /api/trips/:tripId/clone` - Clone trip with options

### Clone Trip Options

```typescript
{
  includeMembers?: boolean                    // Duplicate members
  includeDestinations?: boolean               // Copy destinations
  includeTasks?: boolean                      // Copy tasks
  budgetCloneMode?: 'TEMPLATE' | 'PLANNING' | 'FULL_HISTORY'
  newTripName?: string                        // Override trip name
  newStartDate?: Date                         // Override dates
}
```

**Budget Clone Modes**:
- **TEMPLATE**: Structure only, reset all contributions to 0 (fresh planning)
- **PLANNING**: Structure and budgets, no expenses (reuse budget plan)
- **FULL_HISTORY**: Complete duplicate including all expenses (full ledger)

### TripService Methods

- `createTrip(userId, data)` - Validate dates, generate slug, create with creator
- `getTrips(filters)` - Complex filtering by lifecycle, dates, search, pagination
- `getTripById(tripId, userId)` - Check permissions and return trip
- `updateTrip(tripId, userId, data)` - Validate permissions, update fields
- `deleteTrip(tripId, userId)` - Delete trip and all associated data
- `publishTrip(tripId, userId)` - Change isPublic to true
- `unpublishTrip(tripId, userId)` - Change isPublic to false
- `cloneTrip(tripId, userId, options)` - Create new trip with nested copies

---

## Destinations Module

### Destination Document Schema

```typescript
{
  tripId: ObjectId             // Reference to parent trip
  name: string                 // Destination name (required)
  location: {                  // Optional geographic details
    name: string
    address: string
    placeId: string           // Mapbox identifier
    point: {
      type: 'Point'
      coordinates: [lng, lat]  // GeoJSON format
    }
  }
  arrivalDate: Date           // When visiting
  departureDate: Date         // Must be >= arrivalDate
  notes: string              // Destination description
  imageUrl: string           // Cloudinary URL
  imagePublicId: string      // For deletion
  order: number              // Sequence in trip (1, 2, 3, ...)
  createdAt: Date
  updatedAt: Date
}
```

### Indexes

```
- tripId: 1 (for querying destinations in a trip)
- tripId: 1, order: 1 (for sorted destination listing)
```

### Key Endpoints

**Trip-Scoped**:
- `GET /api/trips/:tripId/destinations` - Get all destinations ordered
- `POST /api/trips/:tripId/destinations` - Create destination
- `PUT /api/trips/:tripId/destinations/:destId` - Update destination
- `DELETE /api/trips/:tripId/destinations/:destId` - Delete destination

**Item Routes**:
- `GET /api/destinations/:destId` - Get single destination details
- `POST /api/destinations/:destId/image` - Upload destination image

### DestinationService

- `getDestinationsByTripId(tripId, userId)` - Ordered by `order` field
- `createDestination(tripId, userId, data)` - Append to trip, auto-increment order
- `updateDestination(tripId, userId, destId, data)` - Update fields
- `deleteDestination(tripId, userId, destId)` - Remove and reorder
- `reorderDestinations(tripId, userId, newOrder)` - Change sequence
- Image handling with Cloudinary cleanup

### Access Control

- Public trips: Anyone can view destinations
- Private trips: Only members can view/edit
- Image upload: Multer with Cloudinary (folder: `nomadly/destinations`)

---

## Members Module

### Key Concepts

- **Creator**: Trip owner, full permissions
- **Member**: Collaborator, can view and contribute

### Member Schema (embedded in Trip)

```typescript
{
  userId: ObjectId         // User reference
  role: 'creator' | 'member'
  joinedAt: Date          // When they joined
  invitedBy: ObjectId    // Who invited them
}
```

### Key Endpoints

- `GET /api/trips/:tripId/members` - List trip members
  - Query: `includeUserDetails=true` for full user objects
- `POST /api/trips/:tripId/members` - Add member by userId, email, or username
- `DELETE /api/trips/:tripId/members/:userId` - Remove member (creator only)
- `PATCH /api/trips/:tripId/members/:userId/role` - Manage roles

### Permissions

```typescript
canModifyTripResources(tripId, userId)  // Creator check
isTripCreator(trip, userId)             // Role validation
isTripMember(trip, userId)              // Membership check
```

### MemberService

- `getTripMembers(tripId, includeUserDetails)` - Get all members
- `addMember(tripId, userId/email/username, invitedBy)` - Add to members
- `removeMember(tripId, userId)` - Remove and update count
- `checkMemberPermission(tripId, userId, role)` - Verify permissions

---

## Tasks Module

### Task Document Schema

```typescript
{
  tripId: ObjectId               // Reference to parent trip
  title: string                  // Task title (required, trimmed)
  description: string            // Task details
  assignedTo: ObjectId[]         // Array of assigned user IDs
  createdBy: ObjectId            // Task creator
  dueDate: Date                  // Optional deadline
  completions: ITaskCompletion[] // Array of completions
  isArchived: boolean            // Soft delete flag
  createdAt: Date
  updatedAt: Date
}

// Task Completion (embedded)
{
  userId: ObjectId               // Who completed it
  completedAt: Date             // When it was completed
}
```

### Indexes

```
- tripId: 1
- isArchived: 1
```

### Key Endpoints

**Trip-Scoped** (at `/api/trips/:tripId/tasks`):
- `GET /` - Get tasks for trip (filter archived)
- `POST /` - Create task

**Item Routes** (at `/api/tasks/:taskId`):
- `PATCH /:taskId` - Update task details
- `DELETE /:taskId` - Delete task
- `POST /:taskId/complete` - Mark as complete by current user
- `DELETE /:taskId/complete` - Remove completion

### TaskService

- `getTasks(tripId, userId, includeArchived)` - Get filtered tasks
- `createTask(tripId, userId, data)` - Create with creator
- `updateTask(tripId, userId, taskId, data)` - Update fields
- `deleteTask(tripId, userId, taskId)` - Archive task
- `completeTask(tripId, userId, taskId)` - Add user completion
- `uncompleteTask(tripId, userId, taskId)` - Remove completion

### Permissions

- Trip members can view all tasks
- Any member can complete/uncomplete task
- Creator or trip owner can update/delete

---

## Budget Module

For detailed budget documentation, see [budget/README.md](budget/README.md)

**Quick Overview**:
- Financial ledger with TripBudget root and Expense entries
- Flexible split methods: equal, custom, percentage
- Three-mode cloning: TEMPLATE, PLANNING, FULL_HISTORY
- Automatic cache synchronization
- All monetary values normalized to 2 decimals

---

## Accommodations Module

### Accommodation Document Schema

```typescript
{
  tripId: ObjectId          // Reference to parent trip
  name: string             // Hotel/accommodation name
  address: string          // Physical address
  bookingUrl: string       // Booking link
  checkIn: Date           // Check-in date/time
  checkOut: Date          // Check-out date/time
  pricePerNight: number   // Nightly rate
  notes: string           // Additional info
  createdAt: Date
  updatedAt: Date
}
```

### Indexes

```
- tripId: 1
```

### Use Cases

- Track multiple accommodations per trip
- Store booking references
- Calculate total accommodation costs
- Share booking details with trip members

---

## Chat Module

### Message Document Schema

```typescript
{
  trip: ObjectId                // Trip this message belongs to
  sender: ObjectId              // User who sent message
  content: string              // Message text (required, trimmed)
  attachments: string[]        // Array of file URLs
  editedAt: Date              // Last edit timestamp
  deleted: boolean            // Soft delete flag
  createdAt: Date
  updatedAt: Date
}
```

### Indexes

```
- trip: 1, createdAt: -1
```

### Socket.IO Events

**Emit from client**:
- `joinRoom` - Connect to trip's message channel
  ```typescript
  { tripId: string }
  ```
- `sendMessage` - Send new message
  ```typescript
  { tripId: string, userId: string, content: string }
  ```

**Receive from server**:
- `receiveMessage` - Broadcast to all in room
  ```typescript
  {
    _id: ObjectId,
    trip: string,
    sender: { _id: string, name: string },
    content: string,
    createdAt: Date
  }
  ```

### Chat Flow

1. User joins trip room via `joinRoom`
2. User sends message via `sendMessage`
3. Message saved to database
4. Server broadcasts `receiveMessage` to all in room
5. Connected clients receive updated message

---

## Memories Module

### Memory Document Schema

```typescript
{
  tripId: ObjectId          // Reference to parent trip
  uploadedBy: ObjectId      // User who uploaded
  url: string              // Cloudinary image/video URL
  publicId: string         // Cloudinary public ID for deletion
  caption: string          // Image description/caption
  createdAt: Date
  updatedAt: Date
}
```

### Indexes

```
- tripId: 1
- tripId: 1, createdAt: -1
```

### Upload Configuration

- Folder: `nomadly/memories`
- Formats: jpg, jpeg, png, webp, mp4, mov
- Stored with Cloudinary public IDs for cleanup

### MemoryService

- `getMemoriesByTripId(tripId, userId)` - Ordered descending
- `uploadMemory(tripId, userId, file, caption)` - Upload to Cloudinary
- `deleteMemory(tripId, userId, memoryId)` - Remove from storage

### Access Control

- Only trip members can upload/delete
- Public trips: Anyone can view memories
- Private trips: Members only

---

## Architecture Notes

- **Permissions**: Centralized in membership system
- **Foreign Keys**: Destinations, tasks, chat messages reference parent trip
- **Soft Deletes**: Tasks use isArchived flag
- **Denormalization**: Trip maintains tasksCount, membersCount
- **Cache**: budgetSummary recomputed from expense ledger
- **Real-time**: Chat uses Socket.IO for live updates
- **Media**: All images via Cloudinary with cleanup on delete

## Data Flow

### Create Trip
1. Validate dates (endDate >= startDate)
2. Generate unique slug
3. Create Trip with creator as first member
4. Initialize empty arrays for destinations, members
5. Return trip object

### Add Destination
1. Verify user is trip member
2. Auto-increment order field
3. Create Destination document
4. Return ordered destination list

### Clone Trip
1. Fetch original trip
2. Create new trip with updated name/dates
3. If includeDestinations: Copy destination documents
4. If includeTasks: Copy task documents
5. If budgetCloneMode: Clone budget (via budgetService)
6. If includeMembers: Copy members (set requester as creator)
7. Return new trip

