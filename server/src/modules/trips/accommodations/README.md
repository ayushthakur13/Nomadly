# Accommodations Module

Trip stay planning and coordination for Nomadly workspace.

## Purpose

- Keep all lodging details in one shared place.
- Track booking references, check-in/check-out windows, and stay notes.
- Support collaborative editing with ownership-aware permissions.

## Schema

```typescript
{
  tripId: ObjectId
  createdBy: ObjectId
  name: string
  address?: string
  bookingUrl?: string
  checkIn?: Date
  checkOut?: Date
  pricePerNight?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

## Endpoints

Trip-scoped (`/api/trips/:tripId/accommodations`):
- `GET /` - List trip accommodations
- `POST /` - Create accommodation

Item routes (`/api/accommodations`):
- `PATCH /:accommodationId` - Update accommodation
- `DELETE /:accommodationId` - Delete accommodation

## Validation Rules

- `name` is required on create.
- `checkOut` must be after/equal to `checkIn` when both are provided.
- `pricePerNight` must be non-negative.
- `bookingUrl` accepts protocol-less input and normalizes to `https://...`.

## RBAC

- Members can create accommodations.
- Edit/delete allowed for:
  - trip creator, or
  - stay creator (`createdBy`), or
  - any member when `trip.stayPermissions.allowMemberStayEdits = true`.

## Query Behavior

- List sorts by `checkIn` ascending, then `createdAt` descending.
