import { Schema, model, Document, Types } from "mongoose";

/**
 * Trip Member (embedded in Trip)
 */
export interface ITripMember {
  userId: Types.ObjectId;
  role: "creator" | "member";
  joinedAt: Date;
  invitedBy?: Types.ObjectId;
}

/**
 * Trip Lifecycle Status Enum
 */
export enum TripLifecycleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

/**
 * Trip Category Enum
 */
export enum TripCategory {
  ADVENTURE = 'adventure',
  LEISURE = 'leisure',
  BUSINESS = 'business',
  FAMILY = 'family',
  SOLO = 'solo',
  COUPLE = 'couple',
  FRIENDS = 'friends',
  BACKPACKING = 'backpacking',
  LUXURY = 'luxury',
  BUDGET = 'budget'
}

/**
 * Location Interface (Canonical GeoJSON-style location)
 */
export interface ILocation {
  name: string;              // Display name (Lucknow, Goa, etc.)
  address?: string;          // Optional formatted address
  placeId?: string;          // Google / Mapbox place id
  point: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
}

/**
 * Engagement Counter Interface
 */
export interface IEngagement {
  likes: number;
  saves: number;
  shares: number;
  views: number;
  clones: number;
}

/**
 * Trip Document Interface
 */
export interface ITrip extends Document {
  _id: Types.ObjectId;
  tripName: string;
  slug?: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  sourceLocation?: ILocation;
  destinationLocation: ILocation;
  coverImageUrl?: string;
  coverImagePublicId?: string;
  category?: TripCategory | string;
  tags?: string[];
  isPublic: boolean;
  isFeatured: boolean;
  lifecycleStatus: TripLifecycleStatus;
  createdBy: Types.ObjectId;
  members: ITripMember[];
  destinations: Types.ObjectId[];
  tasksCount: number;
  membersCount: number; // Cached value derived from members.length - always update from service layer
  engagement: IEngagement;
  budgetSummary?: {
    total: number;
    spent: number;
    // remaining is redundant - calculated as total - spent
  };
  createdAt: Date;
  updatedAt: Date;
  // Derived virtuals
  timeStatus?: 'upcoming' | 'ongoing' | 'completed';
  isOngoing?: boolean;
  durationDays?: number;
}

/**
 * Trip Member Schema (embedded)
 */
const TripMemberSchema = new Schema<ITripMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['creator', 'member'],
      default: 'member',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { _id: false }
);

/**
 * Location Schema (embedded - unified for source and destination)
 */
const LocationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    placeId: {
      type: String
    },
    point: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [lng, lat] - GeoJSON standard
        required: true,
        validate: {
          validator: function(v: any) {
            return Array.isArray(v) && v.length === 2 &&
              Number.isFinite(v[0]) && Number.isFinite(v[1]) &&
              v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
          },
          message: 'Coordinates must be valid [lng, lat] pair'
        }
      }
    }
  },
  { _id: false }
);

/**
 * Engagement Schema (grouped counters)
 */
const EngagementSchema = new Schema<IEngagement>(
  {
    likes: { type: Number, default: 0, min: 0 },
    saves: { type: Number, default: 0, min: 0 },
    shares: { type: Number, default: 0, min: 0 },
    views: { type: Number, default: 0, min: 0 },
    clones: { type: Number, default: 0, min: 0 }
  },
  { _id: false }
);

/**
 * Trip Schema Definition
 */
const tripSchema = new Schema<ITrip>(
  {
    tripName: {
      type: String,
      required: [true, 'Trip name is required'],
      trim: true,
      maxlength: [100, 'Trip name cannot exceed 100 characters'],
      index: true
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function(this: ITrip, value: Date) {
          return value >= this.startDate;
        },
        message: 'End date must be after or equal to start date'
      }
    },
    sourceLocation: {
      type: LocationSchema,
      required: false
    },
    destinationLocation: {
      type: LocationSchema,
      required: [true, 'Destination location is required']
    },
    coverImageUrl: { 
      type: String, 
      default: null 
    },
    coverImagePublicId: { 
      type: String, 
      default: null 
    },
    category: {
      type: String
    },
    tags: [{ 
      type: String, 
      trim: true, 
      lowercase: true 
    }],
    isPublic: { 
      type: Boolean, 
      default: false, 
      index: true 
    },
    isFeatured: { 
      type: Boolean, 
      default: false, 
      index: true 
    },
    lifecycleStatus: {
      type: String,
      enum: Object.values(TripLifecycleStatus),
      default: TripLifecycleStatus.DRAFT,
      index: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Trip creator is required'],
      index: true
    },
    members: { 
      type: [TripMemberSchema], 
      default: [] 
    },
    destinations: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Destination' 
    }],
    tasksCount: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    membersCount: { 
      type: Number, 
      default: 1, 
      min: 0 
      // Cached value for read performance - always update from members.length in service layer
    },
    engagement: {
      type: EngagementSchema,
      default: () => ({
        likes: 0,
        saves: 0,
        shares: 0,
        views: 0,
        clones: 0
      })
    },
    budgetSummary: {
      total: { type: Number, default: 0 },
      spent: { type: Number, default: 0 }
      // remaining is redundant - calculated as total - spent
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound indexes for efficient querying
tripSchema.index({ createdBy: 1, createdAt: -1 });
tripSchema.index({ isPublic: 1, isFeatured: 1, createdAt: -1 });
tripSchema.index({ isPublic: 1, lifecycleStatus: 1 });
tripSchema.index({ startDate: 1, endDate: 1 });
tripSchema.index({ tripName: 'text', 'destinationLocation.name': 'text', description: 'text' });
tripSchema.index({ 'destinationLocation.point': '2dsphere' });

/**
 * Pre-save hook: Sync membersCount with members.length
 * Ensures membersCount stays in sync with the members array
 */
tripSchema.pre<ITrip>('save', function(next) {
  this.membersCount = this.members.length;
  next();
});

/**
 * Virtual: Trip duration in days
 */
tripSchema.virtual('durationDays').get(function(this: ITrip) {
  const diff = this.endDate.getTime() - this.startDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

/**
 * Virtual: Time-based status (derived from dates)
 */
tripSchema.virtual('timeStatus').get(function(this: ITrip) {
  const now = new Date();
  if (now < this.startDate) return 'upcoming';
  if (now > this.endDate) return 'completed';
  return 'ongoing';
});

/**
 * Virtual: Is trip ongoing
 */
tripSchema.virtual('isOngoing').get(function(this: ITrip) {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
});

export default model<ITrip>('Trip', tripSchema);