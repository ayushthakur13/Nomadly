import { Schema, model, Document, Types } from "mongoose";

export interface ISavedTrip extends Document {
  userId: Types.ObjectId;
  tripId: Types.ObjectId;
  createdAt: Date;
}

const savedTripSchema = new Schema<ISavedTrip>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

savedTripSchema.index({ userId: 1, tripId: 1 }, { unique: true });
savedTripSchema.index({ userId: 1 });

export default model<ISavedTrip>("SavedTrip", savedTripSchema);
