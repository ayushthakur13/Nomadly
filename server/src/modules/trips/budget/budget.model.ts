import { Schema, model, Document, Types } from 'mongoose';

export interface IBudgetMember {
  userId: Types.ObjectId;
  plannedContribution: number;
  role: 'creator' | 'member';
  joinedAt: Date;
  isPastMember: boolean;
}

export interface IBudgetRules {
  allowMemberContributionEdits: boolean;
  allowMemberExpenseCreation: boolean;
  allowMemberExpenseEdits: boolean;
}

export interface ITripBudget extends Document {
  _id: Types.ObjectId;
  tripId: Types.ObjectId;
  baseCurrency: string;
  baseBudgetAmount?: number | null;
  createdBy: Types.ObjectId;
  members: IBudgetMember[];
  rules: IBudgetRules;
  createdAt: Date;
  updatedAt: Date;
}

/* ------------------ Subschemas ------------------ */

const BudgetMemberSchema = new Schema<IBudgetMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plannedContribution: {
      type: Number,
      required: true,
      min: [0, 'Planned contribution cannot be negative'],
    },
    role: {
      type: String,
      enum: ['creator', 'member'],
      required: true,
      default: 'member',
    },
    joinedAt: { type: Date, default: Date.now },
    isPastMember: { type: Boolean, default: false },
  },
  { _id: false }
);

const BudgetRulesSchema = new Schema<IBudgetRules>(
  {
    allowMemberContributionEdits: { type: Boolean, default: true },
    allowMemberExpenseCreation: { type: Boolean, default: true },
    allowMemberExpenseEdits: { type: Boolean, default: true },
  },
  { _id: false }
);

/* ------------------ Root Schema ------------------ */

const TripBudgetSchema = new Schema<ITripBudget>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      unique: true,
      index: true,
    },

    baseCurrency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
      default: 'INR',
    },

    baseBudgetAmount: {
      type: Number,
      min: [0, 'Base budget cannot be negative'],
      default: null,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    members: {
      type: [BudgetMemberSchema],
      default: [],
    },

    rules: {
      type: BudgetRulesSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

/* ------------------ Indexes ------------------ */
// Note: createdBy has index: true in field definition

/* ------------------ Guards ------------------ */

/**
 * Ensure only one creator exists in budget members
 */
TripBudgetSchema.pre('save', function (next) {
  try {
    const doc = this as ITripBudget;

    const creators = doc.members.filter(m => m.role === 'creator');
    if (creators.length > 1) {
      return next(new Error('Only one budget creator is allowed'));
    }

    next();
  } catch (err) {
    next(err instanceof Error ? err : new Error('Budget validation failed'));
  }
});

export default model<ITripBudget>('TripBudget', TripBudgetSchema);
