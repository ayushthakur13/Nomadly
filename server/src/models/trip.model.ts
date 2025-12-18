import { Schema, model, Document, Types } from "mongoose";

/**
 * Trip Member (embedded in Trip)
 */
export interface ITripMember {
  userId: Types.ObjectId;
  role: "creator" | "editor" | "viewer";
  joinedAt: Date;
  invitedBy?: Types.ObjectId;
}

/**
 * Location Interface
 */
export interface ILocation {
  name: string;
  address?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId?: string;
}

/**
 * Trip Status Enum
 */
export enum TripStatus {
  DRAFT = 'draft',
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  COMPLETED = 'completed'
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
 * Trip Document Interface
 */
export interface ITrip extends Document {
  _id: Types.ObjectId;
  tripName: string;
  slug: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  mainDestination: string;
  sourceLocation?: ILocation;
  destinationCoordinates?: {
    lat: number;
    lng: number;
  };
  coverImageUrl?: string;
  coverImagePublicId?: string;
  category?: TripCategory | string;
  tags?: string[];
  isPublic: boolean;
  isFeatured: boolean;
  status: TripStatus;
  createdBy: Types.ObjectId;
  members: ITripMember[];
  destinations: Types.ObjectId[];
  tasksCount: number;
  membersCount: number;
  likesCount: number;
  savesCount: number;
  sharesCount: number;
  budgetSummary?: {
    total: number;
    spent: number;
    remaining: number;
  };
  viewsCount: number;
  clonesCount: number;
  createdAt: Date;
  updatedAt: Date;
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
      enum: ['creator', 'editor', 'viewer'],
      default: 'viewer',
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
    mainDestination: {
      type: String,
      required: [true, 'Main destination is required'],
      index: true,
      trim: true
    },
    sourceLocation: {
      name: { type: String },
      address: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      },
      placeId: { type: String }
    },
    destinationCoordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    coverImageUrl: { type: String, default: null },
    coverImagePublicId: { type: String, default: null },
    category: {
      type: String,
      enum: Object.values(TripCategory),
      default: TripCategory.LEISURE
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    isPublic: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: Object.values(TripStatus),
      default: TripStatus.DRAFT,
      index: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Trip creator is required'],
      index: true
    },
    members: { type: [TripMemberSchema], default: [] },
    destinations: [{ type: Schema.Types.ObjectId, ref: 'Destination' }],
    tasksCount: { type: Number, default: 0, min: 0 },
    membersCount: { type: Number, default: 1, min: 0 },
    likesCount: { type: Number, default: 0, min: 0 },
    savesCount: { type: Number, default: 0, min: 0 },
    sharesCount: { type: Number, default: 0, min: 0 },
    budgetSummary: {
      total: { type: Number, default: 0 },
      spent: { type: Number, default: 0 },
      remaining: { type: Number, default: 0 }
    },
    viewsCount: { type: Number, default: 0, min: 0 },
    clonesCount: { type: Number, default: 0, min: 0 }
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
tripSchema.index({ isPublic: 1, status: 1 });
tripSchema.index({ startDate: 1, endDate: 1 });
tripSchema.index({ tripName: 'text', mainDestination: 'text', description: 'text' });
tripSchema.index({ 'destinationCoordinates': '2dsphere' });

/**
 * Virtual: Trip duration in days
 */
tripSchema.virtual('durationDays').get(function(this: ITrip) {
  const diff = this.endDate.getTime() - this.startDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

/**
 * Virtual: Is trip active (ongoing)
 */
tripSchema.virtual('isActive').get(function(this: ITrip) {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
});

export default model<ITrip>('Trip', tripSchema);