import { Schema, model, Document, Types } from "mongoose";

export interface IAIRequest extends Document {
  userId: Types.ObjectId;
  prompt: string;
  response?: any;
  modelName?: string;
  tripDraftId?: Types.ObjectId;
  costEstimate?: number;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const aiRequestSchema = new Schema<IAIRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    prompt: { type: String, required: true },
    response: { type: Schema.Types.Mixed },
    modelName: String,
    tripDraftId: { type: Schema.Types.ObjectId, ref: "Trip" },
    costEstimate: Number,
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  },
  { timestamps: true }
);

aiRequestSchema.index({ userId: 1, createdAt: -1 });

export default model<IAIRequest>("AIRequest", aiRequestSchema);
