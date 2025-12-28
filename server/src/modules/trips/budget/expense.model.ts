import { Schema, model, Document, Types } from "mongoose";

export interface IExpenseSplit {
  userId: Types.ObjectId;
  amount: number;
}

export interface IExpense extends Document {
  tripId: Types.ObjectId;
  title?: string;
  amount: number;
  currency?: string;
  category?: string;
  paidBy: Types.ObjectId;
  splitBetween?: Types.ObjectId[]; // empty -> everyone
  splitMethod?: "equal" | "custom";
  splits?: IExpenseSplit[];
  date?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSplitSchema = new Schema<IExpenseSplit>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
});

const expenseSchema = new Schema<IExpense>(
  {
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    title: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    category: String,
    paidBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    splitBetween: [{ type: Schema.Types.ObjectId, ref: "User" }],
    splitMethod: { type: String, enum: ["equal", "custom"], default: "equal" },
    splits: { type: [expenseSplitSchema], default: [] },
    date: { type: Date, default: Date.now },
    notes: String,
  },
  { timestamps: true }
);

expenseSchema.index({ tripId: 1, date: -1 });

export default model<IExpense>("Expense", expenseSchema);
