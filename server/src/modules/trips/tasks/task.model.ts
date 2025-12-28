import { Schema, model, Document, Types } from "mongoose";

export interface ITaskCompletion {
  userId: Types.ObjectId;
  completedAt: Date;
}

export interface ITask extends Document {
  tripId: Types.ObjectId;
  title: string;
  description?: string;
  assignedTo?: Types.ObjectId[]; // empty means everyone
  createdBy: Types.ObjectId;
  dueDate?: Date;
  status: "open" | "done";
  completions: ITaskCompletion[];
  createdAt: Date;
  updatedAt: Date;
}

const completionSchema = new Schema<ITaskCompletion>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  completedAt: { type: Date, default: Date.now },
});

const taskSchema = new Schema<ITask>(
  {
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    title: { type: String, required: true },
    description: String,
    assignedTo: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: Date,
    status: { type: String, enum: ["open", "done"], default: "open" },
    completions: { type: [completionSchema], default: [] },
  },
  { timestamps: true }
);

taskSchema.index({ tripId: 1, status: 1 });

export default model<ITask>("Task", taskSchema);
