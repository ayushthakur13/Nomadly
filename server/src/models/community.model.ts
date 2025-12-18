import { Schema, model, Document, Types } from "mongoose";

export interface ICommunity extends Document {
  name: string;
  description?: string;
  owners: Types.ObjectId[]; // user ids
  members: { userId: Types.ObjectId; role?: string; joinedAt?: Date }[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const communitySchema = new Schema<ICommunity>(
  {
    name: { type: String, required: true },
    description: String,
    owners: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: String,
        joinedAt: Date,
      },
    ],
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

communitySchema.index({ owners: 1 });

export default model<ICommunity>("Community", communitySchema);
