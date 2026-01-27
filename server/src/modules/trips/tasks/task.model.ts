import { Schema, model, Document, Types } from "mongoose";

export interface ITaskCompletion {
  userId: Types.ObjectId;
  completedAt: Date;
}

export interface ITask extends Document {
  tripId: Types.ObjectId;
  title: string;
  description?: string;
  assignedTo?: Types.ObjectId[];
  createdBy: Types.ObjectId;
  dueDate?: Date;
  completions: ITaskCompletion[];
  isArchived: Boolean;
  createdAt: Date;
  updatedAt: Date;
}

const completionSchema = new Schema<ITaskCompletion>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    completedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const taskSchema = new Schema<ITask>(
  {
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: "User", default: null }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: Date,
    completions: { type: [completionSchema], default: [] },
    isArchived: { type: Boolean, default: false }
  },
  { timestamps: true }
);

taskSchema.index({ tripId: 1 });
taskSchema.index({ isArchived: 1 });

export default model<ITask>("Task", taskSchema);
