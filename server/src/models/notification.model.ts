import { Schema, model, Document, Types } from "mongoose";

export interface INotification extends Document {
  userId: Types.ObjectId; // recipient
  type: string; // 'invite','message','like','system',etc
  payload: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true },
    payload: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default model<INotification>("Notification", notificationSchema);
