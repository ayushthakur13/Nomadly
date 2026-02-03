import { Schema, model, Document, Types } from 'mongoose';

export interface IExpenseSplit {
  userId: Types.ObjectId;
  amount: number;
}

export interface IExpense extends Document {
  tripId: Types.ObjectId;
  title?: string;
  amount: number;
  /**
   * Currency at time of payment (ISO code, e.g. INR, USD)
   * Must match TripBudget.baseCurrency in v1
   */
  currency: string;
  category?: string;
  paidBy: Types.ObjectId;
  createdBy: Types.ObjectId;
  splitMethod: 'equal' | 'custom' | 'percentage';
  splits: IExpenseSplit[];
  date?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/* ------------------ Subschemas ------------------ */

const ExpenseSplitSchema = new Schema<IExpenseSplit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Split amount cannot be negative'],
    },
  },
  { _id: false }
);

/* ------------------ Root Schema ------------------ */

const ExpenseSchema = new Schema<IExpense>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    amount: {
      type: Number,
      required: true,
      min: [0, 'Expense amount cannot be negative'],
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
    },

    category: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    paidBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    splitMethod: {
      type: String,
      required: true,
      enum: ['equal', 'custom', 'percentage'],
    },

    splits: {
      type: [ExpenseSplitSchema],
      required: true,
      default: [],
      validate: {
        validator: function (v: IExpenseSplit[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one split entry is required',
      },
    },

    date: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

/* ------------------ Indexes ------------------ */

ExpenseSchema.index({ tripId: 1, date: -1 });
// Note: paidBy and createdBy have index: true in field definitions

/* ------------------ Guards ------------------ */

/**
 * Ensure financial integrity:
 * Sum of splits must equal total amount
 */
ExpenseSchema.pre('save', function (next) {
  try {
    const doc = this as IExpense;

    if (!Array.isArray(doc.splits) || doc.splits.length === 0) {
      return next(new Error('Expense must contain at least one split'));
    }

    // Financial normalization (rounds to 2 decimals)
    const normalizeMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
    const totalSplit = normalizeMoney(doc.splits.reduce((sum, s) => sum + normalizeMoney(s.amount), 0));
    const amount = normalizeMoney(doc.amount);

    // Allow small floating point tolerance
    if (Math.abs(totalSplit - amount) > 0.01) {
      return next(
        new Error('Sum of split amounts must equal total expense amount')
      );
    }

    next();
  } catch (err) {
    next(err instanceof Error ? err : new Error('Expense validation failed'));
  }
});

export default model<IExpense>('Expense', ExpenseSchema);
