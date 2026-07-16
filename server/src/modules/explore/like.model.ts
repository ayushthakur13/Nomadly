import { Schema, model, Document, Types } from "mongoose";

export interface ITripLike extends Document {
  userId: Types.ObjectId;
  tripId: Types.ObjectId;
  createdAt: Date;
}

const tripLikeSchema = new Schema<ITripLike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

tripLikeSchema.index({ userId: 1, tripId: 1 }, { unique: true });
tripLikeSchema.index({ tripId: 1 });

export default model<ITripLike>("TripLike", tripLikeSchema);
