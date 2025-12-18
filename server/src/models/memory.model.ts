import { Schema, model, Document, Types } from "mongoose";

export interface IMemory extends Document {
  tripId: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  url: string;
  publicId?: string;
  caption?: string;
  createdAt: Date;
  updatedAt: Date;
}

const memorySchema = new Schema<IMemory>(
  {
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    url: { type: String, required: true },
    publicId: String,
    caption: String,
  },
  { timestamps: true }
);

memorySchema.index({ tripId: 1, createdAt: -1 });

export default model<IMemory>("Memory", memorySchema);
