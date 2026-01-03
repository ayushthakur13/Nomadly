import { Schema, model, Document, Types } from 'mongoose';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export interface IInvitation extends Document {
  _id: Types.ObjectId;
  tripId: Types.ObjectId;
  invitedBy: Types.ObjectId;
  invitedUserId?: Types.ObjectId; // If inviting existing user by username
  invitedEmail?: string; // If inviting by email (user may not exist yet)
  status: InvitationStatus;
  message?: string;
  token?: string; // Unique token for email-based invitations
  expiresAt: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const invitationSchema = new Schema<IInvitation>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    invitedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    invitedEmail: {
      type: String,
      lowercase: true,
      trim: true,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(InvitationStatus),
      default: InvitationStatus.PENDING,
      required: true,
      index: true
    },
    message: {
      type: String,
      maxlength: 500
    },
    token: {
      type: String,
      unique: true,
      sparse: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    respondedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for common queries
invitationSchema.index({ tripId: 1, status: 1 });
invitationSchema.index({ invitedUserId: 1, status: 1 });
invitationSchema.index({ invitedEmail: 1, status: 1 });
invitationSchema.index({ token: 1, status: 1 });

// Validate that either invitedUserId or invitedEmail is provided
invitationSchema.pre('save', function(next) {
  if (!this.invitedUserId && !this.invitedEmail) {
    next(new Error('Either invitedUserId or invitedEmail must be provided'));
  } else {
    next();
  }
});

// Prevent modification of accepted/rejected/expired invitations
invitationSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    const immutableStatuses = [InvitationStatus.ACCEPTED, InvitationStatus.REJECTED, InvitationStatus.EXPIRED];
    if (immutableStatuses.includes(this.status as InvitationStatus)) {
      const oldStatus = (this as any)._original?.status;
      if (oldStatus && immutableStatuses.includes(oldStatus)) {
        next(new Error('Cannot modify an invitation that is already accepted, rejected, or expired'));
        return;
      }
    }
  }
  next();
});

const Invitation = model<IInvitation>('Invitation', invitationSchema);

export default Invitation;
