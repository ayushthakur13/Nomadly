import { Schema, model, Document, Types } from "mongoose";

export interface ILike extends Document {
  userId: Types.ObjectId;
  tripId: Types.ObjectId;
  type: "like" | "save";
  createdAt: Date;
}

const likeSchema = new Schema<ILike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    type: { type: String, enum: ["like", "save"], default: "like" },
  },
  { timestamps: true }
);

likeSchema.index({ userId: 1, tripId: 1, type: 1 }, { unique: true });
likeSchema.index({ tripId: 1, createdAt: -1 });

export default model<ILike>("Like", likeSchema);
