# Invitations Module

Trip member invitations supporting both existing users and email-based invites. Handles invitation lifecycle from creation through acceptance/rejection.

---

## Invitation Document Schema

```typescript
{
  tripId: ObjectId              // Target trip
  invitedBy: ObjectId           // Inviter (trip creator)
  invitedUserId: ObjectId      // Invited user ID (if already registered)
  invitedEmail: string         // Invited email (for non-registered users)
  status: InvitationStatus     // PENDING, ACCEPTED, REJECTED, EXPIRED, CANCELLED
  message: string              // Invitation message (max 500 chars)
  token: string               // Unique token for email-based invites
  expiresAt: Date             // Expiration timestamp
  respondedAt: Date           // When user responded
  createdAt: Date
  updatedAt: Date
}
```

---

## Invitation Statuses

```typescript
enum InvitationStatus {
  PENDING = 'pending'      // Awaiting response
  ACCEPTED = 'accepted'    // User accepted, added to members
  REJECTED = 'rejected'    // User declined
  EXPIRED = 'expired'      // Expiration passed
  CANCELLED = 'cancelled'  // Cancelled by inviter
}
```

---

## Indexes

```
- tripId: 1, status: 1          (find pending invites for trip)
- invitedUserId: 1, status: 1   (user's invitation list)
- invitedEmail: 1, status: 1    (for email-based lookup)
- token: 1, status: 1           (validate invitation token)
- expiresAt: 1                  (for cleanup/expiration)
```

---

## Validation Rules

- Must specify either `invitedUserId` OR `invitedEmail` (one required)
- Prevents duplicate invitations to same user
- Prevents inviting already-member users
- Immutable status for final states (accepted, rejected, expired)
- Auto-expire invitations after TTL (default: 7 days)

---

## HTTP Endpoints

**Protected Routes**:
- `GET /api/invitations` - Get user's received invitations
- `GET /api/invitations/sent` - Get sent invitations (if trip creator)
- `POST /api/invitations` - Create invitation (trip creator only)
- `PATCH /api/invitations/:invitationId/accept` - Accept invitation
- `PATCH /api/invitations/:invitationId/reject` - Reject invitation
- `DELETE /api/invitations/:invitationId/cancel` - Cancel (sender only)

---

## InvitationService Methods

### Core Operations

```typescript
createInvitation(data: CreateInvitationDTO): Promise<Invitation>
// Validate and create invite with token
// Generates unique token for email-based invites
// Calculates expiration date (default +7 days)
// Returns invitation object

acceptInvitation(invitationId: string, userId: string): Promise<void>
// Validates invitation is PENDING and not expired
// Adds user to trip members array
// Updates invitation status to ACCEPTED
// Sets respondedAt timestamp

rejectInvitation(invitationId: string, userId: string): Promise<void>
// Marks invitation as REJECTED
// Sets respondedAt timestamp

cancelInvitation(invitationId: string, userId: string): Promise<void>
// Only inviter can cancel
// Marks invitation as CANCELLED

getInvitationsByEmail(email: string): Promise<Invitation[]>
// Find pending invites for email (for non-registered users)
// Used during registration flow

getInvitationsByUser(userId: string): Promise<Invitation[]>
// Get user's received invitations
// Filter by status and sort by recency

expireStaleInvitations(): Promise<void>
// Batch cleanup for cron jobs
// Update invitations past expiresAt to EXPIRED status
```

---

## Invitation Utils

**File**: `invitation.utils.ts`

```typescript
generateInvitationToken(): string
// Generate 32-byte random hex token

calculateExpirationDate(days: number = 7): Date
// Add days to current date/time

validateInvitationRecipient(userId?: string, email?: string): void
// Input validation for recipient
// Ensures one of userId or email is provided
```

---

## Invitation Flow

### For Existing Users

1. Trip creator creates invitation with userId
2. Unique token generated (though not used for registered users)
3. Invitation stored in PENDING status
4. User receives notification (via in-app or email)
5. User accepts via UI button → `PATCH /accept`
6. Service adds user to trip members
7. Invitation marked ACCEPTED

### For Non-Registered Users

1. Trip creator creates invitation with email
2. Unique token generated
3. Email sent to recipient with claim link (contains token)
4. Non-registered user registers with token
5. On successful registration, invitation accepted automatically
6. User added to trip members
7. Invitation marked ACCEPTED

---

## Email Invitations Flow (Detailed)

1. **Create Invitation**:
   - Trip creator provides email address
   - Token generated: `generateInvitationToken()`
   - Expiration calculated: `calculateExpirationDate(7)`
   - Invitation saved with status PENDING

2. **Send Email**:
   - Invitation email sent to recipient
   - Email contains: trip name, inviter name, message, claim link with token
   - Claim link format: `/join?token={token}`

3. **Non-Registered User**:
   - Clicks claim link
   - Redirected to registration form
   - Token passed in URL
   - Registers new account

4. **On Registration**:
   - Backend finds invitation by token
   - Validates: status=PENDING, not expired, email matches
   - Creates new user
   - Accepts invitation automatically
   - Adds user to trip members

5. **Or Existing User**:
   - Accepts invitation via UI
   - Backend validates: status=PENDING, user not already member
   - Adds to trip members
   - Marks as ACCEPTED

---

## Background Jobs

**File**: `jobs/` (implied structure)

Cron jobs for maintenance:

```typescript
expireStaleInvitations()
// Run daily
// Find invitations where expiresAt < now
// Update status to EXPIRED

sendReminderEmails()
// Run weekly
// Find PENDING invitations created 3+ days ago
// Send reminder email to recipients

cleanupExpiredInvitations()
// Run monthly
// Delete invitations with EXPIRED or CANCELLED status older than 30 days
```

---

## Integration Points

**Called by**:
- Trip module when adding members
- Auth module during registration flow
- Trip cloning for member copying

**Calls**:
- User model for user lookup
- Trip model for member addition
- Email service for notifications (implied)

---

## Error Handling

| Scenario | Status | Response |
|----------|--------|----------|
| Trip not found | 404 | "Trip not found" |
| User not found | 404 | "User not found" |
| Duplicate invitation | 409 | "Invitation already sent to this user" |
| User already member | 409 | "User is already trip member" |
| Invalid email format | 400 | "Invalid email address" |
| Expired invitation | 410 | "Invitation has expired" |
| Unauthorized cancel | 403 | "Only inviter can cancel" |
| Already responded | 409 | "Invitation already responded to" |

---

## Response Format

**Create Invitation Success**:
```json
{
  "success": true,
  "message": "Invitation sent",
  "data": {
    "invitation": {
      "id": "507f1f77bcf86cd799439011",
      "tripId": "507f1f77bcf86cd799439012",
      "invitedEmail": "john@example.com",
      "status": "pending",
      "expiresAt": "2025-03-04T10:00:00Z",
      "createdAt": "2025-02-25T10:00:00Z"
    }
  }
}
```

**Get User Invitations**:
```json
{
  "success": true,
  "data": {
    "invitations": [
      {
        "id": "507f1f77bcf86cd799439011",
        "tripId": "507f1f77bcf86cd799439012",
        "trip": {
          "name": "Europe Summer 2025",
          "coverImageUrl": "..."
        },
        "invitedBy": {
          "name": "Sarah",
          "profilePicUrl": "..."
        },
        "status": "pending",
        "message": "Join us for an amazing trip!",
        "expiresAt": "2025-03-04T10:00:00Z"
      }
    ]
  }
}
```

---

## Examples

### Create Invitation (to Existing User)

```typescript
POST /api/invitations
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "tripId": "507f1f77bcf86cd799439012",
  "invitedUserId": "507f1f77bcf86cd799439013",
  "message": "Join us for an amazing European adventure!"
}
```

### Create Invitation (to Email)

```typescript
POST /api/invitations
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "tripId": "507f1f77bcf86cd799439012",
  "invitedEmail": "friend@example.com",
  "message": "You're invited to our trip!"
}
```

### Accept Invitation

```typescript
PATCH /api/invitations/507f1f77bcf86cd799439011/accept
Authorization: Bearer eyJhbGc...
```

### Get Invitations

```typescript
GET /api/invitations
Authorization: Bearer eyJhbGc...

// Returns all invitations received by user
```

