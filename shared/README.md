# Shared Types

This directory contains **domain types shared between client and server** in the Nomadly monorepo.

## Purpose

Provide a single source of truth for **API contracts** and core business domain models that are used by both frontend and backend.

## Principles

### ✅ What belongs here:
- **Domain models** representing API contracts (Trip, User, Destination)
- **Enums** used across client and server (TripLifecycleStatus, TripCategory)
- **DTOs** for API requests/responses (CreateTripDTO, UpdateTripDTO)
- **Common types** used in API communication (Location, LocationDTO)

### ❌ What does NOT belong here:
- Redux state types (client-only)
- Mongoose Document interfaces (server-only)
- React components or hooks (client-only)
- Express middleware types (server-only)
- UI form types (client-only)
- Database schemas (server-only)
- API response wrappers like `{ success: boolean, data: {...} }`

## Structure

```
shared/
  types/
    index.ts          # Main export barrel
    enums.ts          # Shared enums (TripLifecycleStatus, TripCategory, etc.)
    common.ts         # Common types (Location, LocationDTO)
    trip.ts           # Trip domain model and DTOs
    user.ts           # User domain model
    destination.ts    # Destination domain model
```

## Usage

### Client (React/TypeScript)
```typescript
import type { Trip, TripLifecycleStatus, CreateTripDTO } from '../../../shared/types';

// Use in service layer
export const fetchTripAPI = async (id: string): Promise<Trip> => {
  const response = await api.get(`/trips/${id}`);
  return response.data;
};
```

### Server (Node/TypeScript)
```typescript
import { TripLifecycleStatus, TripCategory, type CreateTripDTO } from '../../../../../shared/types';

// Use in controllers and services
export const createTrip = async (data: CreateTripDTO): Promise<ITrip> => {
  // Implementation
};
```

## Guidelines

1. **Framework-agnostic**: Types must not depend on React, Express, Mongoose, Redux, etc.
2. **Dates as strings**: Use `string` for dates in shared types (JSON serialization). Backend can use `Date` in Mongoose schemas.
3. **IDs as strings**: Use `string` for MongoDB ObjectIds in shared types. Backend can use `Types.ObjectId` in Mongoose schemas.
4. **Extend, don't modify**: If one side needs extra fields, extend the shared type locally rather than polluting the shared layer.

## Example: Extending a Shared Type

If the backend needs Mongoose-specific fields:

```typescript
// server/src/modules/trips/core/trip.model.ts
import { Trip } from '../../../../../shared/types';
import { Document, Types } from 'mongoose';

// Extend with Mongoose-specific concerns
export interface ITrip extends Omit<Trip, '_id' | 'createdBy' | 'members'>, Document {
  _id: Types.ObjectId;
  createdBy: Types.ObjectId;
  members: ITripMember[]; // Mongoose subdocument
  // Add Mongoose methods
  comparePassword(password: string): Promise<boolean>;
}
```

If the client needs UI-specific fields:

```typescript
// client/src/features/trips/types/ui.ts
import { Trip } from '../../../shared/types';

// Extend with UI-specific concerns
export interface TripWithUIState extends Trip {
  isExpanded: boolean;
  isEditing: boolean;
}
```

## Maintenance

- **Before adding a type**: Ask "Is this used by BOTH client and server?"
- **Before modifying a type**: Ensure changes are backward compatible or update both sides
- **Keep it minimal**: Only add types that represent true domain contracts
