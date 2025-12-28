import { Schema, model, Document, Types } from "mongoose";

export interface IMessage extends Document {
  trip: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  attachments?: string[]; // urls
  editedAt?: Date;
  deleted?: boolean;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    trip: { type: Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
    attachments: [{ type: String }],
    editedAt: Date,
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ trip: 1, createdAt: -1 });

export default model<IMessage>("Message", messageSchema);
