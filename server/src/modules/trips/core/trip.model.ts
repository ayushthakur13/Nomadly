import { Schema, model, Document, Types } from "mongoose";

// Import shared enums from monorepo shared types
import { TripLifecycleStatus, TripCategory } from '../../../../../shared/types';

// Re-export for backward compatibility within server modules
export { TripLifecycleStatus, TripCategory };

// Backend-specific interfaces (Mongoose Document extensions)
export interface ITripMember {
  userId: Types.ObjectId;
  role: "creator" | "member";
  joinedAt: Date;
  invitedBy?: Types.ObjectId;
}

export interface ILocation {
  name: string;
  address?: string;
  placeId?: string;
  point?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface IEngagement {
  likes: number;
  saves: number;
  shares: number;
  views: number;
  clones: number;
}

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
  membersCount: number;
  engagement: IEngagement;
  budgetSummary?: { total: number; spent: number; };
  createdAt: Date;
  updatedAt: Date;
  timeStatus?: 'upcoming' | 'ongoing' | 'completed';
  isOngoing?: boolean;
  durationDays?: number;
}

const TripMemberSchema = new Schema<ITripMember>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['creator', 'member'], default: 'member', required: true },
  joinedAt: { type: Date, default: Date.now },
  invitedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

const LocationSchema = new Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, trim: true },
  placeId: { type: String },
  point: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number],
      required: false, // Allow manual entry without coordinates
      validate: {
        validator: function(v: any) {
          // If coordinates are provided, they must be valid
          if (!v || !Array.isArray(v)) return true;
          return v.length === 2 &&
            Number.isFinite(v[0]) && Number.isFinite(v[1]) &&
            v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
        },
        message: 'Coordinates must be valid [lng, lat] pair'
      }
    }
  }
}, { _id: false });

const EngagementSchema = new Schema<IEngagement>({
  likes: { type: Number, default: 0, min: 0 },
  saves: { type: Number, default: 0, min: 0 },
  shares: { type: Number, default: 0, min: 0 },
  views: { type: Number, default: 0, min: 0 },
  clones: { type: Number, default: 0, min: 0 }
}, { _id: false });

const tripSchema = new Schema<ITrip>({
  tripName: { type: String, required: [true, 'Trip name is required'], trim: true, maxlength: [100, 'Trip name cannot exceed 100 characters'], index: true },
  slug: { type: String, unique: true, sparse: true, index: true },
  description: { type: String, trim: true, maxlength: [2000, 'Description cannot exceed 2000 characters'] },
  startDate: { type: Date, required: [true, 'Start date is required'] },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: { validator: function(this: ITrip, value: Date) { return value >= this.startDate; }, message: 'End date must be after or equal to start date' }
  },
  sourceLocation: { type: LocationSchema, required: false },
  destinationLocation: { type: LocationSchema, required: [true, 'Destination location is required'] },
  coverImageUrl: { type: String, default: null },
  coverImagePublicId: { type: String, default: null },
  category: { type: String },
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  lifecycleStatus: { type: String, enum: Object.values(TripLifecycleStatus), default: TripLifecycleStatus.DRAFT },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  members: { type: [TripMemberSchema], default: [] },
  destinations: [{ type: Schema.Types.ObjectId, ref: 'Destination' }],
  tasksCount: { type: Number, default: 0 },
  membersCount: { type: Number, default: 0 },
  engagement: { type: EngagementSchema, default: () => ({}) },
  budgetSummary: { total: { type: Number, default: 0 }, spent: { type: Number, default: 0 } }
}, { timestamps: true });

tripSchema.index({ createdAt: -1 });
tripSchema.index({ startDate: 1 });
tripSchema.index({ 'destinationLocation.name': 1 });
tripSchema.index({ lifecycleStatus: 1 });
tripSchema.index({ isPublic: 1 });
tripSchema.index({ 'engagement.views': -1 });

tripSchema.pre('save', function(next) {
  try {
    const doc = this as any;
    if (Array.isArray(doc.members)) {
      doc.membersCount = doc.members.length;
    }
    doc.timeStatus = undefined;
    doc.isOngoing = undefined;
    doc.durationDays = undefined;
    next();
  } catch (err) {
    next(err as any);
  }
});

tripSchema.virtual('destinationPoint').get(function(this: any) {
  return this.destinationLocation?.point;
});

export default model<ITrip>('Trip', tripSchema);
