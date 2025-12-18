import { Schema, model, Document, Types } from "mongoose";

export interface IRelationship extends Document {
  followerId: Types.ObjectId;
  followeeId: Types.ObjectId;
  createdAt: Date;
}

const relationshipSchema = new Schema<IRelationship>(
  {
    followerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    followeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

relationshipSchema.index({ followerId: 1, followeeId: 1 }, { unique: true });
relationshipSchema.index({ followeeId: 1, createdAt: -1 });

export default model<IRelationship>("Relationship", relationshipSchema);
